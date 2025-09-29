# Sistema de Informacion Yami

## Miembros del Equipo

| NIA    | Surnames         | Name    |
|--------|------------------|---------|
| 870373 | Blanchard Lobaco | Daniel  |
| 874417 | Cardiel Gascón   | Enrique |
| 869244 | Sierra Vicén     | Víctor  |

## Descripcion
En este repositorio vamos a almacenar todo el codigo fuente relacionado al sistema de informacion que estamos desarrollando **Yami**. 

Yami es una aplicacion web de servicios alimentarios a domicilio. El objetivo de este repositorio es tener todo el codigo fuente y material de las entregas almacenado en Github y a su vez permitir a todos los integrantes del equipo acceder y modificar de forma rapida, sencilla y eficaz el codigo fuente.
## Contenido

El contenido del repositorio irá evolucionando a lo largo del cuatrimestre. En el repositorio podremos encontrar una carpeta de *Entregas* en la que se podran encontrar carpetas con el nombre *Práctica **i***, donde **i** se corresponde al número de la practica, en la que se podrá ver el contenido que ha sido entregado para la práctica de la semana **i**.

A su vez Podremos encontrar múltiples carpetas relacionadas con el código fuente de nuestra aplicación web. 

<pre lang="markdown">  El nombre y contenido de estas carpetas es variable puesto que aún estamos en desarrollo. </pre>

## Ejecutar venv python

Para trabajar con Python vamos a usar un *Virtual environment* que nos permitira tener controladas todas las versiones de las librerias que usamos. Para poder usar el entorno virtual tenemos que crearlo en primer lugar (En visual studio, abajo a la derecha, donde sale la version de python hacer click y nos dara la opcion de crear un entorno virtual). Una vez creado el entorno virtual, en la terminal nos situamos en el directorio */.venv/Scripts* y ejecutamos en la terminal *activate*. Si se han seguido los pasos al principio de cada linea de la terminal se vera (.venv).

Para tener la ultima version de las librerias que usamos basta ejecutar:
<pre lang="markdown">  pip install -r requirements.txt </pre>

Si utilizamos alguna libreria nueva habra que ejecuatr en la terminal:
<pre lang="markdown">  pip freeze -> requirements.txt </pre>