// De definities van de verschillende beelden inclusief hun onderdelen
icm.factory('Beelden', ['$rootScope', function( $rootScope ) {
    
    
    return {
      reset: function(time) {
        time = time?time:0;
        this.beelden = [
            { beeld: 'summary', title: 'Samenvatting', timestamp: time, beeldonderdeel: 
              [ {id:'situatie', title: 'Situatie', isedit: false, zeker: true}
              ]}          
            ,{ beeld: 'populatie', title: 'Populatie', timestamp: time, beeldonderdeel: 
              [ {title:'Samenvatting',id:'samenvatting', isedit: false, zeker: true},
                {title:'Gebiedsoverzicht',id:'gebied', isedit: false, zeker: true},
                {title:'Besluitsvorming',id:'besluitsvorming', isedit: false, zeker: true},
                {title:'Knelpunten',id:'knelpunten', isedit: false, zeker: true},
                {title:'Acties/maatregelen',id:'maatregelen', isedit: false, zeker: true},               
                {title:'Prognose (verwachting)',id:'prognose', isedit: false, zeker: true}
            ]}
            ,{ beeld: 'evacuatie', title: 'Evacutatie', timestamp: time, beeldonderdeel:
              [ {title:'Samenvatting',id:'samenvatting', isedit: false, zeker: true},
                {title:'Routeoverzicht',id:'routes', isedit: false, zeker: true},                                
                {title:'Besluitsvorming',id:'besluitsvorming', isedit: false, zeker: true},
                {title:'Knelpunten',id:'knelpunten', isedit: false, zeker: true},
                {title:'Acties/maatregelen',id:'maatregelen', isedit: false, zeker: true},          
                {title:'Prognose (verwachting)',id:'prognose', isedit: false, zeker: true}
            ]}        
            ,{ beeld: 'opvang', title: 'Opvang', timestamp: time, beeldonderdeel: 
              [ {title:'Samenvatting',id:'samenvatting', isedit: false, zeker: true},
                {title:'Locatie overzicht',id:'locaties', isedit: false, zeker: true},                
                {title:'Besluitsvorming',id:'besluitsvorming', isedit: false, zeker: true},
                {title:'Knelpunten',id:'knelpunten', isedit: false, zeker: true},
                {title:'Acties/maatregelen',id:'maatregelen', isedit: false, zeker: true},          
                {title:'Prognose (verwachting)',id:'prognose', isedit: false, zeker: true}
            ]}         
            ,{ beeld: 'comms', title: 'Communicatie', timestamp: time, beeldonderdeel: 
              [ {title:'Kernboodschap',id:'kernboodschap', isedit: false, zeker: true},
                {title:'Omgevingsbeeld',id:'omgevingsbeeld', isedit: false, zeker: true},
                {title:'Communicatie extern',id:'extern', isedit: false, zeker: true},
                {title:'Communicatie intern',id:'intern', isedit: false, zeker: true}
            ]}
        ]
        return this.beelden;
      },
      beelden: []
    };
}]);

/*TT: Cow temporarily moved to a global because signalR breaks from within a factory */
var cow = new Cow.core({
      wsUrl: '/Cow/signalr'
    });   
    cow.userStore().loaded.then(function(){
    if (!cow.users('1')){
        cow.users({_id:'1'}).data('name','Anonymous').sync();
    }
    cow.user('1'); //set current user
});
icm.factory('Core', ['$rootScope', function($rootScope) {
   /*
   var cow = new Cow.core({
          wsUrl: '/Cow/signalr'
        });   
    cow.userStore().loaded.then(function(){
        if (!cow.users('1')){
            cow.users({_id:'1'}).data('name','Anonymous').sync();
        }
        cow.user('1'); //set current user
    });
    tmp = cow;
    */
   return cow;

}]);

icm.filter('beeldfilter', function() {
  return function(items,beeld) {
    if(!beeld) {
      return items;
    }
    if(!items) {
      return [];
    }
    return _(items).filter(function(d){
           return d.data('beeld') == beeld; 
    });
  }
});
icm.filter('onderdeelfilter', function() {
  return function(items,onderdeel) {
    if(!onderdeel) {
      return items;
    }
    return _(items).filter(function(d){
           return d.data('beeldonderdeel') == onderdeel; 
    });
  }
});
icm.filter('berichtfilter', function() {
  return function(items,me,you) {
    if(!items) {
      return [];
    }
    return  _.chain(items).filter(function(d){
           return  ((d.data('van') == me &&  d.data('naar') == you) || (d.data('naar') == me && d.data('van') == you)); 
    }).sortBy('_created').value()
  }
});
icm.filter('filterIncident', function() {
        return function(items, type){
           if(!items) {
            return [];
          }
          return _(items).filter(function(d){
            return (d.data('type')!==undefined && d.data('type').id == type)
          })
          
        }
      });
icm.factory('Utils', ['$rootScope', function ($rootScope) {
  return {
   
      nondeleted : function(item) {
        return !item.deleted();
      },      
      beeldcontent: function(item) {
        return item.data('beeldcontent');
      },
      user: "",
      incident: "",
      onlineUsers: function (users,peers) {
        var activeUsers = _.pluck(_.filter(users,function(d){return !d.deleted()}),'_id');
        var onlinePeers = _.map( _.filter(peers,function(d){return !d.deleted()}),function(d){return d.data('userid')})
        var onlineUsers = [];        
        _.each(activeUsers,function(d){
          var user = {};
          user.online = _.contains(onlinePeers,d);
          user.name = d;
          user.timestamp = 0;
          onlineUsers.push(user)
        });
        return onlineUsers;
      },            
      project: {},
      projectlist: [],
      itemlist: [],
      userlist: [],
      peerlist: [],
      users: [],
      beeldcontentDiff: function(item) {
        if(!item) return '';
        var deltas = item.deltas();
        var oldValue = '';
        for (var i =  deltas.length - 2; i >= 0; i--)
        {
          if (deltas[i].data.beeldcontent !== undefined)
          {
            oldValue = deltas[i].data.beeldcontent;
            break;
          }
        }
        return TextDifference(oldValue, item.data('beeldcontent'));
      }
    }; 

}]);

icm.directive('contenteditable', function() {
  return {
    restrict: 'A', // only activate on element attribute
    require: '?ngModel', // get a hold of NgModelController
    link: function(scope, element, attrs, ngModel) {
      if(!ngModel) return; // do nothing if no ng-model
       
      // Specify how UI should be updated
      ngModel.$render = function() {
        element.html(ngModel.$viewValue || '');
      };
      // Write data to the model
      function read() {
        var html = element.html();
        // When we clear the content editable the browser leaves a <br> behind
        // If strip-br attribute is provided then we strip this out
        if( attrs.stripBr && html == '<br>' ) {
          html = '';
        }
        ngModel.$setViewValue(html);
      }
     
      // Listen for change events to enable binding
      element.on('blur keyup change', function() {
        scope.$apply(read);
      });
      read(); // initialize
    }
  };
});
