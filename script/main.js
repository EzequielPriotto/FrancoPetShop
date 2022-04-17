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
      dondeEstoy: "",
      tipoEnvio: "retiro_fisico",

      fondoOtaku: false,

      nombre: "",
      apellido: "",
      calificacion: 0,
      opinion: "",

      opinionesGuardadas: [],

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

    let guardarOpiniones
    guardarOpiniones = JSON.parse(localStorage.getItem("opinionesGuardadas"));
    if (!guardarOpiniones) {
      this.opinionesGuardadas = []
      localStorage.setItem("opinionesGuardadas",JSON.stringify(this.opinionesGuardadas));
    } else {
      this.opinionesGuardadas = guardarOpiniones
    }


    // LLAMAMOS A MI API

    fetch('https://apipetshop.herokuapp.com/api/articulos')
      .then(response => response.json())
      .then(data => {

        // ALMACENAMOS EL RESULTADO DE LA API EN DATA
        this.data = data.response

        // LE ASIGNAMOSA NUESTRO ARRAYFARMACIA LOS PRODUCTOS DE FARMACIA

        this.arrayFarmacia = this.data.filter(producto => producto.tipo === "Medicamento");
        this.arrayJuguetes = this.data.filter(producto => producto.tipo === "Juguete");

        // TRAEMOS NUESTRO ARRAY DE STOCKS DE FARMACIA DE LA BASE DE DATOS
        let html = document.querySelector('html')

        html.id === "farmacia" ? this.dondeEstoy = "farmacia" : html.id === "juguetes" ? this.dondeEstoy = "juguetes" : ""


        // SI NO EXISTE, PRIMERO LE ASIGANAMOS A STOCKSF EL VALOR DE LOS STOCKS QUE TRAE EL API
        // LUEGO, SUBIMOS ESTE ARRAY DE STOCKS A LA BASE DE DATOS

     
          let stockjAux = JSON.parse(localStorage.getItem(`jugueteStock`));
          if (!stockjAux) {

            this.stocksJ = this.arrayJuguetes.map(producto => producto.stock);
            localStorage.setItem(`jugueteStock`, JSON.stringify(this.stocksJ));

          }
          else {
            this.stocksJ = stockjAux
          }
        

      
          let stockfAux = JSON.parse(localStorage.getItem(`farmaciaStock`));
          if (!stockfAux) {
            this.stocksF = this.arrayFarmacia.map(producto => producto.stock);
            localStorage.setItem(`farmaciaStock`, JSON.stringify(this.stocksF));

          }
          else {
            this.stocksF = stockfAux
          }
        
        // SI YA EXISTE, SIMPLEMENTE LE ASIGNAMOS A NUESTRA VARIABLE EL VALOR DE LOS STOCKS DE LA BASE DE DATOS



        // LE ASIGNAMOS A NUESTRO ARRAYFARMACIA LOS PRODUCTOS DE JUGUETES



      })
  },

 
  methods: {
    funcionOpiniones() {

      let opinionTemp = {
        "nombre": this.nombre,
        "apellido": this.apellido,
        "calificacion": this.calificacion,
        "opinion": this.opinion,
      }


      this.opinionesGuardadas.push(opinionTemp)
      localStorage.setItem("opinionesGuardadas",JSON.stringify(this.opinionesGuardadas));
    },
   
    alerta() { 

    },
    // JIJIJA :D

    secret() {

      if (this.fondoOtaku == false) {
        Swal.fire({
          title: 'QUE EMPIECE LA FIESTA',
          width: 500,
          padding: '9em',
          color: 'white',
          background: 'url(../assets/eduardo.png)',
          backdrop: `
            rgba(0,0,123,0.4)
            url("https://sweetalert2.github.io/images/nyan-cat.gif")
            top left
            repeat
          `
        })
        this.fondoOtaku = true
      }
      else if (this.fondoOtaku == true) {
        this.fondoOtaku = false

      }
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
        if (producto.tipo == "Medicamento") {
          let stockIndex = this.buscarProductoEnArray(producto._id, this.arrayFarmacia);
          console.log("Posicion en stock: " + stockIndex);
          this.stocksF[stockIndex] = this.stocksF[stockIndex] - 1;
          console.log('Stock de ' + producto.nombre + 'cambiado');
          localStorage.setItem(`farmaciaStock`, JSON.stringify(this.stocksF));
          nuevoProducto.subtotal = nuevoProducto.cantidad * nuevoProducto.precio;
          // PUSHEAMOS EL NUEVO PRODUCTO AL ARRAY EN MI JS
          this.storageCarrito.push(nuevoProducto);
          // ACTUALIZAMOS EN LA BASE DE DATOS NUESTRO ARRAY
          localStorage.setItem("cart", JSON.stringify(this.storageCarrito));
          this.actualizarSubtotal();
        }
        else {
          let stockIndex = this.buscarProductoEnArray(producto._id, this.arrayJuguetes);
          console.log("Posicion en stock: " + stockIndex);
          if(this.stocksJ[stockIndex] != 0){
            this.stocksJ[stockIndex] = this.stocksJ[stockIndex] - 1;
            console.log('Stock de ' + producto.nombre + 'cambiado');
            localStorage.setItem(`jugueteStock`, JSON.stringify(this.stocksJ));
            nuevoProducto.subtotal = nuevoProducto.cantidad * nuevoProducto.precio;
            // PUSHEAMOS EL NUEVO PRODUCTO AL ARRAY EN MI JS
            this.storageCarrito.push(nuevoProducto);
            // ACTUALIZAMOS EN LA BASE DE DATOS NUESTRO ARRAY
            localStorage.setItem("cart", JSON.stringify(this.storageCarrito));
            this.actualizarSubtotal();
          } else { 
            this.faltaStock();
          }
          
        }

        // ACTUALIZAMOS EL STOCK

        // CALCULAMOS EL SUBTOTAL
        
      }

      else {
        // SI YA EXISTE, DEFINIMOS EL PRODUCTO EXISTENTE EN BASE AL ID DEL PRODUCTO TOCADO
        // PERO USANDO EL PRODUCTO DE LA BASE DE DATOS

        let productoExistente = this.storageCarrito[this.buscarProducto(nuevoProducto._id)]
        // LE RESTAMOS EL STOCK Y LO ACTULIZAMOS EN LA BASE DE DATOS

        if (producto.tipo == "Medicamento") {
          let stockIndex = this.buscarProductoEnArray(producto._id, this.arrayFarmacia);
          console.log("Posicion en stock: " + stockIndex);
          if(this.stocksF[stockIndex] != 0){
            this.stocksF[stockIndex] = this.stocksF[stockIndex] - 1;
            console.log('Stock de ' + producto.nombre + 'cambiado');
            localStorage.setItem(`farmaciaStock`, JSON.stringify(this.stocksF));
            productoExistente.cantidad += 1;
            productoExistente.subtotal = productoExistente.cantidad * productoExistente.precio;
            localStorage.setItem("cart", JSON.stringify(this.storageCarrito));
          } else {
            this.faltaStock();
          }
        }
        else{
          let stockIndex = this.buscarProductoEnArray(producto._id, this.arrayJuguetes);
          console.log("Posicion en stock: " + stockIndex);
          if(this.stocksJ[stockIndex] != 0){
            this.stocksJ[stockIndex] = this.stocksJ[stockIndex] - 1;
            console.log('Stock de ' + producto.nombre + 'cambiado');
            localStorage.setItem(`jugueteStock`, JSON.stringify(this.stocksJ));

            productoExistente.cantidad += 1;
            productoExistente.subtotal = productoExistente.cantidad * productoExistente.precio;
            localStorage.setItem("cart", JSON.stringify(this.storageCarrito));
          } else {
            this.faltaStock();
          }
        }


        // LE SUMAMOS LA CANTIDAD
        
      }

      // ACTUALIZAMOS EL SUBTOTAL
      this.actualizarSubtotal()
    },

    // AL TOCAR EL BOTON DE - SE EJECUTA ESTA FUNCION

    restarProducto(producto) {
      // GUARDAMOS AL PRODUCTO QUE SE QUIERE RESTAR UNA UNIDAD EN LA VARIABLE NUEVOPRODUCTO
      let nuevoProducto = producto;

      // LE SUMAMOS UNO AL STOCK Y ACTUALIZAMOS


      // SI HAY UN SOLO ELEMENTO EN EL CARRITO LLAMAMOS A LA FUNCION DE ELIMINAR PRODUCTO
      if (this.storageCarrito[this.storageCarrito.indexOf(nuevoProducto)].cantidad == 1) {
        this.eliminarProducto(nuevoProducto);
      }
      // SINO, LE RESTAMOS UNO A LA CANTIDAD, CALCULAMOS EL SUBTOTAL Y ACTUALIZAMOS EN LA BASE DE DATOS
      else {

        if (producto.tipo == "Medicamento") {
          let stockIndex = this.buscarProductoEnArray(producto._id, this.arrayFarmacia);
          this.stocksF[stockIndex] = this.stocksF[stockIndex] + 1;
          console.log('Stock de ' + producto.nombre + 'cambiado');
          localStorage.setItem(`farmaciaStock`, JSON.stringify(this.stocksF));
        }
        else{
          let stockIndex = this.buscarProductoEnArray(producto._id, this.arrayJuguetes);
          this.stocksJ[stockIndex] = this.stocksJ[stockIndex] + 1;
          console.log('Stock de ' + producto.nombre + 'cambiado');
          localStorage.setItem(`jugueteStock`, JSON.stringify(this.stocksJ));
        }

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
          if(producto.tipo == "Medicamento"){
            let stockIndex = this.buscarProductoEnArray(producto._id, this.arrayFarmacia);
            this.stocksF[stockIndex] = this.arrayFarmacia[stockIndex].stock;
          localStorage.setItem(`farmaciaStock`, JSON.stringify(this.stocksF));

          } else {
            let stockIndex = this.buscarProductoEnArray(producto._id, this.arrayJuguetes);
            this.stocksJ[stockIndex] = this.arrayFarmacia[stockIndex].stock;
             localStorage.setItem(`jugueteStock`, JSON.stringify(this.stocksJ));

          }
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
      console.log(total)
      this.storageCarrito.forEach(producto => {
        console.log(producto)
        total += producto.subtotal
        console.log(total)
      });
      console.log("total" + total);
      this.subtotalCarrito = total;
      this.storageLength = this.storageCarrito.length;
      // console.log("length: " + this.storageLength);
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
          this.stocksF = this.arrayFarmacia.map(producto => producto.stock)
          localStorage.setItem("farmaciaStock", JSON.stringify(this.stocksF));
          this.stocksJ = this.arrayJuguetes.map(producto => producto.stock)
          localStorage.setItem("jugueteStock", JSON.stringify(this.stocksF));
          Swal.fire(
            'Eliminado!',
            'El carrito ha sido vaciado con exito',
            'success'
          )
          this.actualizarSubtotal()
        }
      })

    },
    buscarProductoEnArray(id, array) {
      for (var i = 0; i < array.length; i++) {
        if (array[i]._id == id) {
          return i;
        }
      }
      return -1;
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

    faltaStock() {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No hay suficiente stock de ese medicamento!',
      })

    },




    //  NO TOCAR POR EL MOMENTO XD

    crearBoleta() {

      var doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "landscape" });
      let array = this.storageCarrito
      
      function generateData(array) {
        let result = []
        let totalCant = 0;
        let totalsubtotal = 0;

        array.forEach(producto => {
          let data = {
            "producto": `${producto.nombre}`,
            "cantidad": `${producto.cantidad} unidades`,
            "precio": `$ ${producto.precio}`,
            "subtotal": `$ ${producto.subtotal}`,
          }
          totalCant += producto.cantidad
          totalsubtotal += producto.subtotal
          result.push(data)
        })
        let data = {
            "producto": "TOTAL",
            "cantidad": `${totalCant} unidades`,
            "precio":"----",
            "subtotal": `$ ${totalsubtotal}`,
        }
        result.push(data)
        return result
      }
      function createHeaders(keys) {
        var result = [];
        for (var i = 0; i < keys.length; i += 1) {
          result.push({
            id: keys[i],
            name: keys[i],
            prompt: keys[i],
            width: 100,
            height: 30,
            align: "center",
            padding: 0
          });
        }
        return result;
      }
      var headers = createHeaders([
        "producto",
        "cantidad",
        "precio", 
        "subtotal"
        
      ]);
      doc.text("RESUMEN DE COMPRA", 85, 18);
      doc.table(0, 30, generateData(array), headers, { autoSize: false });
      // doc.text(this.nombreInput + " " + this.apellidoInput, 100, 25);
      doc.text("Nombre y apellido-", 100, 25);
      
      doc.save('pepe.pdf')
      this.storageCarrito = []
      localStorage.setItem("cart", JSON.stringify(this.storageCarrito));

    },

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
