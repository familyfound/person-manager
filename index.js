
var _ = require('lodash')
  , BaseManager = require('manager')

module.exports = Manager

function Manager(io) {
  this.io = io
  BaseManager.call(this, {
    defaultNode: {
      data:{},
      rels:{},
      more:{}
    }
  })
  this.listen()
}

Manager.prototype = _.extend({}, BaseManager.prototype, {
  listen: function () {
    var that = this
    this.io.on('person', function (id, person) {
      that.got(id, person)
    })
    this.io.on('person:more', function (id, person) {
      that.got(id, person)
    })
  },
  load: function (id, gens, npeople) {
    this.io.emit('get:pedigree', id, gens)
    this.io.emit('get:todos', id, npeople)
  },
  set: function (id, data, done) {
    console.error('tried to set', id, data)
  },
  setAttr: function (id, attr, data, done) {
    if (attr !== 'data') 
    console.error('tried to set', id, attr, data)
  },
  gotData: function (id, data) {
    var person = this._map[id]
    person.data = data
    this.got(id, person)
  },
  setCompleted: function (id, val) {
    this.io.emit('set:completed', id, val, function (person) {
      if (person) this.gotData(id, person)
    }.bind(this))
  },
  setStarred: function (id, val) {
    this.io.emit('set:starred', id, val, function (person) {
      if (person) this.gotData(id, person)
    }.bind(this))
  },
  setTodoDone: function (id, type, val) {
    this.io.emit('set:todo:done', id, type, val, function (person) {
      if (person) this.gotData(id, person)
    }.bind(this))
  },
  setTodoHard: function (id, type, val) {
    this.io.emit('set:todo:hard', id, type, val, function (person) {
      if (person) this.gotData(id, person)
    }.bind(this))
  }
})

