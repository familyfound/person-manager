
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
      person.loading = false
      that.got(id, person)
    })
    this.io.on('person:loading', function (id) {
      that.got(id, {loading: true})
    })
    this.io.on('history', function (items) {
      that.got('history', {items: items})
    })
    this.io.on('history:item', function (item) {
      if (!that._map.history) that._map.history = {items:[]}
      if (!that._map.history.items) that._map.history.items = []
      that._map.history.items.unshift(item)
      that.trigger('history', that._map.history)
    })
    this.io.on('starred', function (items) {
      var ids = items.map(function (item) {
        that.got(item.id, {data: item})
        return item.id
      })
      that.got('starred', {ids: ids})
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

  setNote: function (id, text) {
    this.io.emit('set:note', id, text, function (person) {
      if (person) this.gotData(id, person)
    }.bind(this))
  },
  setCompleted: function (id, val) {
    this.io.emit('set:completed', id, val, function (person) {
      if (person) this.gotData(id, person)
    }.bind(this))
  },
  setStarred: function (id, val) {
    this.io.emit('set:starred', id, val, function (person) {
      this.updateStars(id, val)
      if (person) this.gotData(id, person)
    }.bind(this))
  },
  setTodoDone: function (id, type, key, val) {
    this.io.emit('set:todo:done', id, type, key, val, function (person) {
      if (person) this.gotData(id, person)
    }.bind(this))
  },
  setTodoHard: function (id, type, key, val) {
    this.io.emit('set:todo:hard', id, type, key, val, function (person) {
      if (person) this.gotData(id, person)
    }.bind(this))
  },

  updateStars: function (id, val) {
    var ids = this._map.starred.ids
    if (!val) {
      var idx = ids.indexOf(id)
      if (idx !== -1) {
        ids.splice(idx, 1)
      }
    } else {
      ids.unshift(id)
    }
    this.got('starred', {ids: ids})
  }
})

