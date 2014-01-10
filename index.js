
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
    this.io.on('more_person', function (id, person) {
      that.got(id, person)
    })
  },
  load: function (id, gens, npeople, dtree, dcraw) {
    function done(){
      dtree()
      dcraw()
    }
    this.io.emit('getsome', id, gens, npeople, done)
  },
})
