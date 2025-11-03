import React from 'react';
//import Header from '../components/Header';

//creamos el componente 
const Home = () => {



    //funcion asincrona que se ejecuta al hacer clic en el botón
    const handleCreateClient = async() =>{

        const nuevoClienteDatos = {

            email:  `cliente.web.${Date.now()}@ejemplo.com`,
            password: "contraseñaWEB",
            sub_plan: "Basic",
            name: "Pedro",
            surname: "Miana",
            address: "C/Web",
            city: "Freetown",
            postal_code: "50001",
            dni: "12345678W",
            phone_number: "string"
        };

        try {
            const respuesta = await fetch('http://127.0.0.1:8000/api/create_client',
                 {       //Obj de config
                method: 'POST', //porque estamos creando un cliente
                headers: {  //para avisar que el contenido es json
                    'Content-Type': 'application/json'
                }   ,
                body: JSON.stringify(nuevoClienteDatos) //convertimos a json
            });

            if(!respuesta.ok) {
                //Si la respuesta no es correcta (error 400-500), error
                const error = await respuesta.json();
                throw new Error(error.detail || 'Error al crear el cliente');
            }

            const resultado = await respuesta.json();
            console.log('Cliente creado', resultado);
            alert('Cliente creado ID:', resultado.client_id );

        } catch (error) {
            console.error('Hubo un error al crear el cliente:', error);
            
        }
    };

    //Esto es lo que se muestra por pantalla
    return (
        <div>
            <h1>Holaa</h1>
            <p>Bienvenido a Yami. Pulsa el botón para crear un nuevo cliente de prueba.</p>
            <button onClick={handleCreateClient}>  {/* Cuando se haga clic */}
                Crear Cliente
            </button>
        </div>
    );
};

export default Home;