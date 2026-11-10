# Guía de trabajo del backend

Este proyecto usa arquitectura limpia. Antes de crear o modificar archivos, revisa la estructura, los nombres, los imports y los README del módulo afectado. Sigue las convenciones que ya existan en el sistema de archivos; si una convención no está definida, toma como referencia el módulo `users` y mantén la decisión consistente. No reorganices ni renombres archivos ajenos a la tarea sin necesidad.

## Estructura actual

- `src/<modulo>/domain/entities/`: entidades y reglas del negocio.
- `src/<modulo>/domain/repositories/`: contratos de persistencia que necesita el negocio.
- `src/<modulo>/application/use-cases/`: acciones de la aplicación y coordinación de reglas.
- `src/<modulo>/infrastructure/repositories/`: implementaciones concretas de los contratos.
- `src/<modulo>/presentation/`: entrada y salida de la aplicación, cuando se implemente.
- `src/shared/domain/errors/`: errores de dominio compartidos.
- `tests/<modulo>/`: pruebas organizadas según la capa y el componente correspondiente.

Usa los nombres de archivo existentes como referencia: `user.entity.ts`, `user.repository.ts`, `register-user.use-case.ts` e `in-memory.user-repository.ts`. En los imports relativos de TypeScript se usa la extensión `.ts`; para contratos importados solo como tipos, usa `import type`.

## Dirección de dependencias

- `domain` no debe depender de `application`, `infrastructure`, `presentation`, frameworks ni bases de datos.
- `application` puede depender de `domain` y de código compartido de dominio, pero no de implementaciones de `infrastructure` ni de transporte HTTP.
- `infrastructure` implementa contratos definidos hacia el interior y puede depender de `domain`.
- `presentation` adapta las entradas y salidas y, cuando corresponda, conecta los casos de uso con las implementaciones concretas. Mantén esa conexión fuera de `domain` y `application`.

## Inversión de dependencias obligatoria

Al crear un caso de uso que necesite persistencia u otro servicio externo, define o reutiliza primero una abstracción en la capa interior apropiada. Para repositorios de este proyecto, el contrato va en `src/<modulo>/domain/repositories/`. El caso de uso recibe ese contrato por el constructor y trabaja únicamente con él; nunca instancia ni importa el repositorio concreto.

Cada repositorio concreto va en `src/<modulo>/infrastructure/repositories/` e implementa el contrato del dominio. Sus métodos deben respetar las firmas y la semántica del contrato. Si cambia la tecnología de almacenamiento, los casos de uso y las entidades deben seguir funcionando sin cambios.

Ejemplo vigente: `RegisterUserUseCase` depende de `UserRepository`; `InMemoryUserRepository` implementa `UserRepository`. Conserva esa dirección en los nuevos módulos.

## Al terminar un cambio

Revisa los imports para detectar dependencias que apunten hacia una capa exterior. Añade o actualiza pruebas del comportamiento afectado siguiendo la ubicación y el estilo de las pruebas existentes. Ejecuta `npm test` y la comprobación de TypeScript con `npx tsc --noEmit` cuando el cambio toque código TypeScript; comunica cualquier fallo existente o introducido.
