---
name: arquitectura-limpia
description: Diseña, amplía y revisa aplicaciones frontend y backend con arquitectura limpia. Úsala al organizar módulos por capa, integrar una interfaz con una API o decidir dónde colocar reglas de negocio, casos de uso, contratos, adaptadores y composición.
---

# Arquitectura limpia para frontend y backend

## Ubícate en el proyecto

Lee las instrucciones del repositorio, los README del módulo y un flujo existente desde su punto de entrada hasta sus adaptadores y pruebas. Sigue las convenciones locales de nombres e imports. Si el proyecto tiene frontend y backend, aplica esta estructura por separado dentro del directorio de fuentes de cada aplicación.

| Responsabilidad | Directorio dentro de cada aplicación |
| --- | --- |
| Entidades e invariantes | `src/<modulo>/domain/entities/` |
| Contratos de repositorio | `src/<modulo>/domain/repositories/` |
| Casos de uso | `src/<modulo>/application/use-cases/` |
| Implementaciones de repositorio | `src/<modulo>/infrastructure/repositories/` |
| Interfaz o entrada HTTP | `src/<modulo>/presentation/` |
| Errores de dominio compartidos | `src/shared/domain/errors/` |
| Pruebas | `tests/<modulo>/`, organizadas por capa |

Usa estos directorios para módulos nuevos tanto en frontend como en backend y crea solo los que necesite la funcionalidad. En proyectos existentes, respeta el directorio de fuentes y las convenciones equivalentes ya establecidas.

## Mantén las dependencias hacia el interior

- **Dominio.** Las entidades protegen las invariantes del negocio. Los contratos de repositorio describen las operaciones y la semántica que necesita el negocio. Mantén los valores y errores del dominio independientes de la interfaz visual, del navegador, de HTTP, del framework, del ORM y de la base de datos.
- **Aplicación.** Cada caso de uso coordina una acción y recibe por constructor las abstracciones que usa. Reutiliza los contratos existentes o define la abstracción mínima en la capa interior que la necesita. Mantén los tipos de entrada y salida independientes del transporte y de la UI.
- **Infraestructura.** Implementa los contratos mediante adaptadores. En frontend, un repositorio puede consumir la API o usar almacenamiento del navegador. En backend, puede usar memoria o una base de datos. Traduce los datos y fallos externos al contrato interior. Al cambiar de adaptador, conserva la semántica de las búsquedas, el orden prometido y los conflictos. Cuando el negocio exige unicidad, el backend debe hacerla cumplir al escribir.
- **Presentación.** En frontend, ubica pantallas, componentes del módulo y su lógica de interacción en `presentation/`. Desde ahí invoca casos de uso, valida el formato de los formularios y presenta estados de carga, éxito y error. En backend, adapta las entradas y respuestas HTTP y traduce los errores en el borde. Coloca las reglas de negocio en dominio o aplicación según su responsabilidad.
- **Composición.** Conecta adaptadores, casos de uso y puntos de entrada donde el framework o el proyecto ya ensambla dependencias. Puede ser el arranque, el registro de dependencias, un proveedor o una factoría del módulo en el borde. `app.composition.ts` es un ejemplo del backend de referencia y solo hace falta un archivo dedicado si la estructura del proyecto lo justifica. Respeta el ciclo de vida de los adaptadores que comparten estado.

## Integra y verifica el flujo

- Para integrar frontend y backend, usa el contrato público de la API. El adaptador frontend traduce peticiones, respuestas y errores al contrato que consume el caso de uso. El backend sigue validando sus reglas aunque el frontend valide el formulario. Si el proyecto comparte tipos, usa los del contrato público y mantén las capas internas de ambas aplicaciones independientes.
- Para una funcionalidad nueva, identifica la regla y el contrato de entrada y salida. Sigue el flujo desde las capas interiores hasta la pantalla, la ruta HTTP u otro punto de entrada normal. Para cambiar un adaptador, prueba la semántica del contrato y ajusta el ensamblado en el punto de entrada existente.
- En una revisión, sigue los imports y la creación de instancias para localizar dependencias que crucen hacia afuera. Señala el archivo, la responsabilidad que quedó en la capa incorrecta y dónde moverla.
- Añade o actualiza pruebas del comportamiento afectado. Comprueba las invariantes, la coordinación con dobles del contrato, la semántica del adaptador y el flujo desde la UI o la ruta HTTP cuando cambie su integración. Ejecuta las verificaciones del proyecto destino y comunica cualquier fallo observado.

Consulta [el flujo de frontend](references/frontend.md) al integrar una pantalla con una API y [la referencia TypeScript de clean-backend](references/clean-backend-typescript.md) para ejemplos de repositorios, rutas HTTP y pruebas del servidor.
