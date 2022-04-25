
Vue.createApp({
  data() {
    return {
      data: [],

      arrayJuguetes: [],
      arrayFarmacia: [],

      storageListID: [],
      storageCarrito: [],

      originalFarmacia: [],
      originalJuguetes: [],

      storageLength: 0,
      subtotalCarrito: 0,
      dondeEstoy: "",


      nombre: "",
      apellido: "",
      calificacion: 0,
      opinion: "",
      opinionesGuardadas: [
      ],

      filtros: {
        rangoPrecio: 0,
        criterioOrden: "Relevancia",
        valorBusqueda: "",
      },

      tipoEnvio: "retiro_fisico",
      codigoDescuento: "",
      precioTotal: 0,
      isValido: "",

      nombreInput: "",
      apellidoInput: "",
      dniInput: "",

      fondoOtaku: false,
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
      this.opinionesGuardadas = [
        {
          "nombre": 'Lionel',
          "apellido": 'Messi',
          "calificacion": 5,
          "opinion": 'eeee, la veda que la pagina un golazo viste',
        },
        {
          "nombre": 'Eduardo',
          "apellido": 'Mendoza',
          "calificacion": 3,
          "opinion": 'Esta ok. 🥄',
        },
        {
          "nombre": 'Valentino',
          "apellido": 'Arena',
          "calificacion": 5,
          "opinion": 'Agregame a Steam Eduardo 😡',
        },
      ]
      localStorage.setItem("opinionesGuardadas", JSON.stringify(this.opinionesGuardadas));
    } else {
      this.opinionesGuardadas = guardarOpiniones
    }
    // LLAMAMOS A NUESTRA API

    fetch('https://apipetshop.herokuapp.com/api/articulos')
      .then(response => response.json())
      .then(data => {

        // ALMACENAMOS EL RESULTADO DE LA API EN DATA
        this.data = data.response

        // LE ASIGNAMOSA NUESTRO ARRAYFARMACIA LOS PRODUCTOS DE FARMACIA

        this.arrayFarmacia = this.data.filter(producto => producto.tipo === "Medicamento");
        this.arrayJuguetes = this.data.filter(producto => producto.tipo === "Juguete");
        this.originalFarmacia = this.data.filter(producto => producto.tipo === "Medicamento");
        this.originalJuguetes = this.data.filter(producto => producto.tipo === "Juguete");

        // TRAEMOS NUESTRO ARRAY DE STOCKS DE FARMACIA DE LA BASE DE DATOS
        let html = document.querySelector('html')

        html.id === "farmacia" ? this.dondeEstoy = "farmacia" : html.id === "juguetes" ? this.dondeEstoy = "juguetes" : ""

        // PREGUNTA SI ESTA EN EL CARRITO, PARA ALMACENAR SU STOCK EN CASO DE QUE EXISTE EN EL CARRITO.
        // ASI PODER HACERLO CONSISTENTE 

        this.arrayFarmacia.forEach(productoUsar => {
          let indexOfProduct = this.buscarProductoEnArray(productoUsar._id, this.storageCarrito);
          let indexOfArray = this.buscarProductoEnArray(productoUsar._id, this.arrayFarmacia);
          if (indexOfProduct != -1) {
            productoUsar.stock = this.storageCarrito[indexOfProduct].stock;
          }
        })

        this.arrayJuguetes.forEach(productoUsar => {
          let indexOfProduct = this.buscarProductoEnArray(productoUsar._id, this.storageCarrito);
          let indexOfArray = this.buscarProductoEnArray(productoUsar._id, this.arrayJuguetes);
          if (indexOfProduct != -1) {
            productoUsar.stock = this.storageCarrito[indexOfProduct].stock;
          }
        })
      })

    this.precioTotal = this.subtotalCarrito;


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
      localStorage.setItem("opinionesGuardadas", JSON.stringify(this.opinionesGuardadas));
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

      const agregarProductoAlCarrito = (array) => {

        if (!this.storageListID.includes(nuevoProducto._id)) {
          // SI NO EXISTE:
          // LE AGREGAMOS LA PROPIEDAD CANTIDAD 
          nuevoProducto.cantidad = 1;
          // LE QUITAMOS AL ARRAY STOCKS (EN EL ELEMENTO QUE CORRESPONDE) UNA UNIDAD
          let productoIndex = this.buscarProductoEnArray(producto._id, array);
          nuevoProducto.stock -= 1;
          nuevoProducto.subtotal = nuevoProducto.cantidad * nuevoProducto.precio;
          // PUSHEAMOS EL NUEVO PRODUCTO AL ARRAY EN MI JS
          this.storageCarrito.push(nuevoProducto);
          // ACTUALIZAMOS EN LA BASE DE DATOS NUESTRO ARRAY
          array[productoIndex].stock = nuevoProducto.stock;
          localStorage.setItem("cart", JSON.stringify(this.storageCarrito));
          this.actualizarSubtotal();
        }
        else {
          // SI YA EXISTE, DEFINIMOS EL PRODUCTO EXISTENTE EN BASE AL ID DEL PRODUCTO TOCADO
          // PERO USANDO EL PRODUCTO DE LA BASE DE DATOS

          let productoExistente = this.storageCarrito[this.buscarProducto(nuevoProducto._id)]
          // LE RESTAMOS EL STOCK Y LO ACTULIZAMOS EN LA BASE DE DATOS


          let stockIndex = this.buscarProductoEnArray(producto._id, array);
          console.log("Posicion en stock: " + stockIndex);
          if (productoExistente.stock != 0) {
            productoExistente.cantidad += 1;
            productoExistente.stock -= 1;
            productoExistente.subtotal = productoExistente.cantidad * productoExistente.precio;
            array[stockIndex].stock = productoExistente.stock;
            localStorage.setItem("cart", JSON.stringify(this.storageCarrito));
          } else {
            this.faltaStock(producto.tipo);
          }
        }
      }
      if (producto.tipo == "Medicamento") {
        agregarProductoAlCarrito(this.arrayFarmacia)
      }
      else if (producto.tipo == "Juguete") {
        agregarProductoAlCarrito(this.arrayJuguetes)
      }
      // LE SUMAMOS LA CANTIDAD
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
        this.storageCarrito[this.storageCarrito.indexOf(nuevoProducto)].cantidad -= 1;
        this.storageCarrito[this.storageCarrito.indexOf(nuevoProducto)].subtotal = this.storageCarrito[this.storageCarrito.indexOf(nuevoProducto)].cantidad * this.storageCarrito[this.storageCarrito.indexOf(nuevoProducto)].precio;
        this.storageCarrito[this.storageCarrito.indexOf(nuevoProducto)].stock += 1;

        const sacarProducto = (array) => {
          let stockIndex = this.buscarProductoEnArray(producto._id, array);
          array[stockIndex].stock = this.storageCarrito[this.storageCarrito.indexOf(nuevoProducto)].stock;
        }
        if (producto.tipo == "Medicamento") {
          sacarProducto(this.arrayFarmacia)
        }
        else if (producto.tipo == "Juguete") {
          sacarProducto(this.arrayJuguetes)
        }

        localStorage.setItem("cart", JSON.stringify(this.storageCarrito));
      }
      this.actualizarSubtotal()
    },
    vaciarCarrito() {
      if (this.storageCarrito.length > 0) {
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
            this.arrayFarmacia = [...this.originalFarmacia];
            this.arrayJuguetes = [...this.originalJuguetes];
            this.storageCarrito = [];
            localStorage.setItem("cart", JSON.stringify(this.storageCarrito));
            Swal.fire(
              'Eliminado!',
              'El carrito ha sido vaciado con exito',
            ).then(() => {
              this.actualizarSubtotal();
              location.reload();

            })
          }
        })
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `El carrito se encuentra vacio!`,
          position: 'center',
        })
      }

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

          const eliminarProductoDelCarrito = (arrayOriginal) => {
            let stockIndex = this.buscarProductoEnArray(producto._id, arrayOriginal);
            arrayOriginal[stockIndex].stock += 1;
          }

          if (producto.tipo == "Medicamento") {
            eliminarProductoDelCarrito(this.originalFarmacia)
          }
          else if (producto.tipo == "Juguetes") {
            eliminarProductoDelCarrito(this.originalJuguetes)
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
      this.storageCarrito.forEach(producto => {
        total += producto.subtotal
      });
      this.subtotalCarrito = total;
      this.storageLength = this.storageCarrito.length;
      // console.log("length: " + this.storageLength);
    },

    // AL TOCAR VACIAR CARRITO SETEAMOS EL ARRAY EN []

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

    faltaStock(tipo) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `No hay suficiente stock de ese ${tipo}!`,
      })

    },
    //  NO TOCAR POR EL MOMENTO XD
    crearBoleta() {

      Swal.fire({
        title: 'Ingrese sus datos',
        html:
          '<p> para completar la compra</p>' +
          '<input id="swal-input1" class="swal2-input" placeholder="nombre">' +
          '<input id="swal-input2" class="swal2-input" placeholder="apellido">' +
          '<input id="swal-input3" class="swal2-input" placeholder="dni">',
        focusConfirm: false,
        preConfirm: () => {
          this.nombreInput = document.getElementById('swal-input1').value
          this.apellidoInput = document.getElementById('swal-input2').value
          this.dniInput = document.getElementById('swal-input3').value
        },
        showCancelButton: true,


      }).then((result) => {

        if (result.isConfirmed && this.nombreInput != "" && this.apellidoInput != "" && this.dniInput != "") {
          var doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "landscape" });
          let array = this.storageCarrito
          let precioFinal =  this.isValido ==  "Cupon Valido (35% off)" ? `${this.precioTotal} (Descuento del 35% off aplicado)`:  this.precioTotal
          function generateData(array) {
            let result = []
            let totalCant = 0;
            let totalsubtotal = 0;
            array.forEach(producto => {
              let data = {
                "producto": `${producto.nombre}`,
                "cantidad": `${producto.cantidad} unidades`,
                "precio x unidad": `$ ${producto.precio}`,
                "subtotal": `$ ${producto.subtotal}`,
              }
              result.push(data)
              totalCant += producto.cantidad
            })
            let data = {
              "producto": "TOTAL",
              "cantidad": `${totalCant} unidades`,
              "precio x unidad": "----",
              "subtotal": `$${precioFinal}`,
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
                width: 90,
                height: 30,
                align: "center",
                padding: 0,

              });
            }
            return result;
          }
          var headers = createHeaders([
            "producto",
            "cantidad",
            "precio x unidad",
            "subtotal"

          ]);

          doc.setFont("helvetica", "bold");
          doc.text("RESUMEN DE COMPRA", 100, 18);
          doc.setFont("helvetica", "normal");
          doc.text("Nombre: " + this.nombreInput, 5, 25);
          doc.text("Apellido: " + this.apellidoInput, 5, 35);
          doc.text("DNI: " + this.dniInput, 5, 45);
          doc.text("Tipo de envio: " + `${this.tipoEnvio === "retiro_fisico" ? "Retiro por el Local" : "Envio a domicilio"}`, 5, 55);
          doc.table(5, 65, generateData(array), headers, { autoSize: false });
          doc.save('resumenCompra.pdf');
          this.storageCarrito = [];
          this.subtotalCarrito = 0;
          this.dniInput = ""
          this.apellidoInput = ""
          this.nombreInput = ""
          localStorage.setItem("cart", JSON.stringify(this.storageCarrito));
          location.reload();

        }
        else {
          Swal.fire({
            icon: "error",
            title: "Parece que algo salio mal!",
          })
          this.dniInput = ""
          this.apellidoInput = ""
          this.nombreInput = ""
        }
      })


    }
  },

  computed: {
    filtrarMayorMenor() {

      if (this.filtros.criterioOrden == "Mayor") {
        if (this.dondeEstoy == "farmacia") {
          this.arrayFarmacia = this.arrayFarmacia.sort((a, b) => b.precio - a.precio);
        } else {
          this.arrayJuguetes = this.arrayJuguetes.sort((a, b) => b.precio - a.precio);
        }
      }
      else if (this.filtros.criterioOrden == "Menor") {
        if (this.dondeEstoy == "farmacia") {
          this.arrayFarmacia = this.arrayFarmacia.sort((a, b) => a.precio - b.precio);
        } else {
          this.arrayJuguetes = this.arrayJuguetes.sort((a, b) => a.precio - b.precio);
        }
      }
      else{
         const collator = new Intl.Collator('en');

        if (this.dondeEstoy == "farmacia") {
          this.arrayFarmacia = this.arrayFarmacia.sort((a, b) => collator.compare(a._id, b._id));
        } else {
          this.arrayJuguetes = this.arrayJuguetes.sort((a, b) => collator.compare(a._id, b._id));
        }
      }

    },
    filtro() {
      const filtroPrecio = (array, arrayOriginal) => {
        let arrayAux = []
        if (this.filtros.rangoPrecio != 0) {
          arrayAux = array.filter(producto => producto.precio <= this.filtros.rangoPrecio);
        }
        else {
          arrayAux = arrayOriginal
        }
        return arrayAux
      }

      const filtroPorBusqueda = (array, arrayOriginal) => {
        let arrayAux = [];
        if (this.filtros.valorBusqueda == "") {
          arrayAux = array
        } else {
          arrayAux = array.filter(producto => producto.nombre.toUpperCase().includes(this.filtros.valorBusqueda.toUpperCase()));

        }
        return arrayAux
      }



      if (this.dondeEstoy === "farmacia") {
        this.arrayFarmacia = this.originalFarmacia
        let arrayFarmaciaFiltrado = filtroPrecio(this.arrayFarmacia, this.originalFarmacia);
        let arrayFarmaciaFiltrado2 = filtroPorBusqueda(arrayFarmaciaFiltrado, this.originalFarmacia);
        this.arrayFarmacia = arrayFarmaciaFiltrado2;
      }
      else if (this.dondeEstoy === "juguetes") {
        this.arrayJuguetes = this.originalJuguetes
        let arrayJugueteFiltrado = filtroPrecio(this.arrayJuguetes, this.originalJuguetes);
        let arrayJugueteFiltrado2 = filtroPorBusqueda(arrayJugueteFiltrado, this.originalJuguetes);
        this.arrayJuguetes = arrayJugueteFiltrado2;
      }

    },
    actualizarPrecio() {
      this.precioTotal = this.subtotalCarrito;
      let codigosDeDescuento = ["pepitoGamer", "eduardoCoin123", "zeke55", "goku123", "frankkaster", "GOKUTEAMO1234"]
      if (this.codigoDescuento === "") {
        this.isValido = ""
      }
      else {
        let arrayAux = codigosDeDescuento;
        codigo = arrayAux.filter(cupon => cupon == this.codigoDescuento)
         

        if (codigo.length > 0) {
          this.isValido = "Cupon Valido (35% off)"
          this.precioTotal = Math.round(this.precioTotal - (this.precioTotal * 0.35))
        }
        else {
          this.precioTotal = this.subtotalCarrito;
          this.isValido = "Cupon Invalido"
        }

      }
    }
  }
}).mount('#app')

var open = 0;
function openNav() {
  if (open == 0) {
    document.getElementById("sidebar").classList.add("sidebar-active");
    document.getElementById("sidebar-background").classList.add("sidebar-background-active");
    document.getElementById("sidebar-toggle").classList.add("sidebar-toggle-active");
    open = 1;
  } else {
    document.getElementById("sidebar").classList.remove("sidebar-active");
    document.getElementById("sidebar-background").classList.remove("sidebar-background-active");
    document.getElementById("sidebar-toggle").classList.remove("sidebar-toggle-active");
    open = 0;
  }
}

function closeNav() {
  document.getElementById("sidebar").classList.remove("sidebar-active");
  document.getElementById("sidebar-background").classList.remove("sidebar-background-active");
  document.getElementById("sidebar-toggle").classList.remove("sidebar-toggle-active");
}
