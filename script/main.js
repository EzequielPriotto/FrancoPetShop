Vue.createApp({
  data() {

    return {
      data: [],

      arrayJuguetes: [],
      arrayFarmacia: [],
      storageListID: [],
      storageCarrito: [],
      
      storageLength: 0,
      subtotalCarrito: 0,

      stocksF: [],
      stocksJ: [],

      tipoEnvio: "retiro_fisico",

      fondoOtaku: false
    }
  },

  created() {
    // ALMACENAMOS EL ARRAY DEL CARRITO DE LA BASE DE DATOS EN MI JS
    let carrito
    carrito = JSON.parse(localStorage.getItem("cart"));
    
    // SI NO EXISTE CAMBIAMOS EL UNDEFINED POR UN ARRAY VACIO PARA PODER TRABAJAR CON EL CARRITO
    if (!carrito) {
      this.storageCarrito = []
    }
    // SI EXISTE LO ALMACENAMOS EN STORAGECARRITO

    else {
      this.storageCarrito = carrito;
    }

    // ITERAMOS EL CARRITO Y DEFINIMOS LA SUMA DE LOS SUBTOTALES

    let total = 0;
    this.storageCarrito.forEach(producto => {
      total += producto.subtotal
    });
    
    this.subtotalCarrito = total;

    // VERIFICAMOS EL LARGO DEL ARRAY DEL CARRITO PARA VER CUANTOS PRODUCTOS HAY
    // Y PODER CAMBIAR DE FORMA DINAMICA EL NUMERITO ROJO
    this.storageLength = this.storageCarrito.length;

    // LLAMAMOS A MI API

    fetch('https://apipetshop.herokuapp.com/api/articulos')
      .then(response => response.json())
      .then(data => {
    
        // ALMACENAMOS EL RESULTADO DE LA API EN DATA
        this.data = data.response

        // LE ASIGNAMOSA NUESTRO ARRAYFARMACIA LOS PRODUCTOS DE FARMACIA
     
        this.arrayFarmacia = this.data.filter(producto => producto.tipo === "Medicamento");
        
        // TRAEMOS NUESTRO ARRAY DE STOCKS DE FARMACIA DE LA BASE DE DATOS
        
        let stockfAux = JSON.parse(localStorage.getItem("stockF"));

        // SI NO EXISTE, PRIMERO LE ASIGANAMOS A STOCKSF EL VALOR DE LOS STOCKS QUE TRAE EL API
        // LUEGO, SUBIMOS ESTE ARRAY DE STOCKS A LA BASE DE DATOS

        if(!stockfAux){
          this.stocksF =  this.arrayFarmacia.map(producto => producto.stock)
          localStorage.setItem("stockF", JSON.stringify(this.stocksF));
        }

        // SI YA EXISTE, SIMPLEMENTE LE ASIGNAMOS A NUESTRA VARIABLE EL VALOR DE LOS STOCKS DE LA BASE DE DATOS

        else{
          this.stocksF =  stockfAux
        }
        

        // LE ASIGNAMOS A NUESTRO ARRAYFARMACIA LOS PRODUCTOS DE JUGUETES

        this.arrayJuguetes = this.data.filter(producto => producto.tipo === "Juguete");

        
      })
  },

  methods: {
    alerta() {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Sus datos se enviaron',
        showConfirmButton: false,
        timer: 1500
      })
    },
        // JIJIJA :D

    secret() {
      this.fondoOtaku == false ? this.fondoOtaku = true : this.fondoOtaku == true ? this.fondoOtaku = false : ""
    },

    // AL TOCAR EL BOTON DE AGREGAR O + SE EJECUTA ESTA FUNCION

    agregarProducto(producto) {
    // GUARDAMOS AL PRODUCTO QUE SE QUIERE AGREGAR EN LA VARIABLE NUEVOPRODUCTO
      let nuevoProducto = producto
      
    // GUARDAMOS TODOS LOS ID DE MI CARRITO DE LA BASE DE DATOS PARA COMPROBAR
    // SI YA EXISTE ALGUN PRODUCTO CON ESE ID EN NUESTRO CARRITO

      this.storageListID = this.storageCarrito.map(element => element._id)
      if (!this.storageListID.includes(nuevoProducto._id)) {
   
        // SI NO EXISTE:
        
        // LE AGREGAMOS LA PROPIEDAD CANTIDAD 
        nuevoProducto.cantidad = 1;
        // LE QUITAMOS AL ARRAY STOCKS (EN EL ELEMENTO QUE CORRESPONDE) UNA UNIDAD
        this.stocksF[this.arrayFarmacia.indexOf(nuevoProducto)] = this.stocksF[this.arrayFarmacia.indexOf(nuevoProducto)] - 1;
        
        // ACTUALIZAMOS EL STOCK
        localStorage.setItem("stockF", JSON.stringify(this.stocksF));
        
        // CALCULAMOS EL SUBTOTAL
        nuevoProducto.subtotal = nuevoProducto.cantidad * nuevoProducto.precio;
        // PUSHEAMOS EL NUEVO PRODUCTO AL ARRAY EN MI JS
        this.storageCarrito.push(nuevoProducto);
        // ACTUALIZAMOS EN LA BASE DE DATOS NUESTRO ARRAY
        localStorage.setItem("cart", JSON.stringify(this.storageCarrito));
      }

      else {
        // SI YA EXISTE, DEFINIMOS EL PRODUCTO EXISTENTE EN BASE AL ID DEL PRODUCTO TOCADO
        // PERO USANDO EL PRODUCTO DE LA BASE DE DATOS
        
        let productoExistente = this.storageCarrito[this.buscarProducto(nuevoProducto._id)]
        
        // LE SUMAMOS LA CANTIDAD
        productoExistente.cantidad += 1;
        // LE RESTAMOS EL STOCK Y LO ACTULIZAMOS EN LA BASE DE DATOS
        this.stocksF[this.arrayFarmacia.indexOf(nuevoProducto)] -= 1;
        localStorage.setItem("stockF", JSON.stringify(this.stocksF));
        
        // LE CALCULAMOS EL SUBTOTAL Y LO SUBIMOS A LA BASE DE DATOS 
        productoExistente.subtotal = productoExistente.cantidad * productoExistente.precio;
        localStorage.setItem("cart", JSON.stringify(this.storageCarrito));
      }
      
      // ACTUALIZAMOS EL SUBTOTAL
      this.actualizarSubtotal()
    },

    // AL TOCAR EL BOTON DE - SE EJECUTA ESTA FUNCION

    restarProducto(producto) {
    // GUARDAMOS AL PRODUCTO QUE SE QUIERE RESTAR UNA UNIDAD EN LA VARIABLE NUEVOPRODUCTO
      let nuevoProducto = producto;
      
      // LE SUMAMOS UNO AL STOCK Y ACTUALIZAMOS
      this.stocksF[this.arrayFarmacia.indexOf(nuevoProducto)] += 1;
      localStorage.setItem("stockF", JSON.stringify(this.stocksF));
      
      // SI HAY UN SOLO ELEMENTO EN EL CARRITO LLAMAMOS A LA FUNCION DE ELIMINAR PRODUCTO
    if (this.storageCarrito[this.storageCarrito.indexOf(nuevoProducto)].cantidad == 1) {        
      this.eliminarProducto(nuevoProducto);
    }
    // SINO, LE RESTAMOS UNO A LA CANTIDAD, CALCULAMOS EL SUBTOTAL Y ACTUALIZAMOS EN LA BASE DE DATOS
      else {

        this.storageCarrito[this.storageCarrito.indexOf(nuevoProducto)].cantidad -= 1;
        this.storageCarrito[this.storageCarrito.indexOf(nuevoProducto)].subtotal = this.storageCarrito[this.storageCarrito.indexOf(nuevoProducto)].cantidad * this.storageCarrito[this.storageCarrito.indexOf(nuevoProducto)].precio;
        localStorage.setItem("cart", JSON.stringify(this.storageCarrito));
      }
      this.actualizarSubtotal()


    },

    // TOCAR ELIMINAR O LLEGAR A 1 PRODUCTO Y QUERER RESTARLO SE EJECUTA
    eliminarProducto(producto) {
      // UTILIZAMOS SWEET ALERT PARA VERIFICAR SI ESTA SEGURO
      Swal.fire({
        title: 'Estas seguro?',
        text: "Se eliminara permanentemente!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, borralo!'
      }).then((result) => {

      // SI ES ASI PROCEDEMOS A ELIMINAR EL PRODUCTO CON EL SPLICE 
        if (result.isConfirmed) {
          this.storageCarrito.splice(this.storageCarrito.indexOf(producto), 1);
          localStorage.setItem("cart", JSON.stringify(this.storageCarrito));
          Swal.fire(
            'Eliminado!',
            'Su producto fue removido con exito',
            'success'
          )
          this.actualizarSubtotal()

        }
      })



    },
    actualizarSubtotal() {
      let total = 0;

      this.storageCarrito.forEach(producto => {
        total += producto.subtotal
      });
      this.subtotalCarrito = total;
      this.storageLength = this.storageCarrito.length;
      console.log("length: " + this.storageLength);
    },
   
   // AL TOCAR VACIAR CARRITO SETEAMOS EL ARRAY EN []

    vaciarCarrito() {
      Swal.fire({
        title: 'Estas seguro?',
        text: "Se eliminara permanentemente!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, borralo!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.storageCarrito = [];
          localStorage.setItem("cart", JSON.stringify(this.storageCarrito));
          this.stocksF =  this.arrayFarmacia.map(producto => producto.stock)
          localStorage.setItem("stockF", JSON.stringify(this.stocksF));
          Swal.fire(
            'Eliminado!',
            'El carrito ha sido vaciado con exito',
            'success'
          )
          this.actualizarSubtotal()
        }
      })

    },
  
   // ITERAMOS SOBRE EL ARRAY BUSCANDO LA POSICION EN LA QUE EL ID QUE LE PASAMOS COINCIDA CON
  //  ALGUN ID QUE HAYA EN EL CARRITO, SI ENCUENTRA DEVUELVE EL INDICE, SI NO UN -1

    buscarProducto(id) {
      for (var i = 0; i < this.storageCarrito.length; i++) {
        if (this.storageCarrito[i]._id == id) {
          return i;
        }
      }
      return -1;
    },

  //  NO TOCAR POR EL MOMENTO XD

    crearBoleta() {
      let doc = new jsPDF();
      
      doc.text(20, 20, this.nombre);
      doc.text(20, 30, this.apellido);
      doc.text(20, 40, this.email);
      
      // Save the PDF
      doc.save('boleta.pdf');
  }

  },

}).mount('#app')




var open = 0;
function openNav() {
  if (open == 0) {
    document.getElementById("sidebar").style.left = "0%";
    document.getElementById("sidebar-background").style.left = "70.6%";
    document.getElementById("sidebar-toggle").style.left = "65%";
    open = 1;
  } else {
    document.getElementById("sidebar").style.left = "100%";
    document.getElementById("sidebar-background").style.left = "100%";
    document.getElementById("sidebar-toggle").style.left = "91%";
    open = 0;
  }
}

function closeNav() {
  document.getElementById("sidebar").style.left = "100%";
  document.getElementById("sidebar-background").style.left = "100%";
  document.getElementById("sidebar-toggle").style.left = "91%";

}
