var open = 0;
function openNav(){
    if(open == 0){
      document.getElementById("sidebar").style.left = "0%";
      document.getElementById("sidebar-background").style.left = "70.6%";
      document.getElementById("sidebar-toggle").style.left = "65%";
      var body = document.getElementsByTagName('body')[0]
      // body.style.overflow = 'hidden';
      open = 1;
    } else {
      document.getElementById("sidebar").style.left = "100%";
      document.getElementById("sidebar-background").style.left = "100%";
      document.getElementById("sidebar-toggle").style.left = "91%";
      var body = document.getElementsByTagName('body')[0]
      // body.style.overflow = 'auto';
    open = 0;
  }
}
        
function closeNav(){
  document.getElementById("sidebar").style.left = "100%";
  document.getElementById("sidebar-background").style.left = "100%";
  document.getElementById("sidebar-toggle").style.left = "91%";
  var body = document.getElementsByTagName('body')[0]
  body.style.overflow = 'auto';
}

Vue.createApp({
    data() {
      return {
        fondoOtaku: false
       
      }
    },

    created() {
      
    },
    methods: {
      alerta: function(){
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Sus datos se enviaron',
          showConfirmButton: false,
          timer: 1500
        })
      },
      secret: function(){
        this.fondoOtaku == false ? this.fondoOtaku = true :  this.fondoOtaku == true ?  this.fondoOtaku = false: ""
      },
   
      
    },

  }).mount('#app')