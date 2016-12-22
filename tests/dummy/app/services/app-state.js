import Ember from 'ember';

export default Ember.Service.extend({
  isLeftSidebarOpen:false,
  isRightSidebarOpen:false,
  scrollingX :true,
scrollingY : true,
animating : true,
bouncing : true,
locking : false,
paging : false,
snapping : false,
zooming : false,
  useNativeScroll:false,
  errorArray: ["some error","some other damn error"]

});
