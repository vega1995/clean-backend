# Referencia de clean-backend en TypeScript

El proyecto usa Node.js, TypeScript en modo estricto con ESM, Express, Zod y Vitest. La organización por módulo agrupa las piezas que colaboran para una capacidad del negocio. La tabla recoge rutas de este backend. En otros proyectos, conecta las dependencias desde el punto de entrada, proveedor o factoría que ya cumpla esa función.

| Responsabilidad | Ubicación en el proyecto y ejemplo |
| --- | --- |
| Entidad e invariantes | `src/<modulo>/domain/entities/`, como `user.entity.ts` |
| Contrato de persistencia | `src/<modulo>/domain/repositories/`, como `user.repository.ts` |
| Acción de aplicación | `src/<modulo>/application/use-cases/`, como `register-user.use-case.ts` |
| Adaptador concreto | `src/<modulo>/infrastructure/repositories/`, como `in-memory.user-repository.ts` |
| Controlador y esquema HTTP | `src/<modulo>/presentation/controllers/` y `presentation/schemas/`, como `register-user-controller.ts` y `register-user.schema.ts` |
| Rutas del módulo | `src/<modulo>/routes/`, como `payment.route.ts`. Son parte del borde HTTP. |
| Errores compartidos y middleware HTTP | `src/shared/domain/errors/` y `src/server/presentation/http/`, respectivamente |
| Composición y arranque | `src/app.composition.ts` exporta `createApp()`. `src/main.ts` inicia la escucha. |
| Pruebas | `tests/<modulo>/` refleja las capas y usa archivos `*.test.ts`. |

En este proyecto, usa la extensión `.ts` en imports relativos e `import type` cuando el símbolo solo se use como tipo. Con `erasableSyntaxOnly`, declara la propiedad y asígnala en el constructor en lugar de usar una propiedad de parámetro.

## Users muestra la inversión de dependencias

`RegisterUserUseCase` recibe un `UserRepository`. Crea el usuario mediante `User.create`, consulta el email ya normalizado y guarda mediante el contrato. `InMemoryUserRepository` implementa ese contrato y rechaza duplicados sin sobrescribir. La raíz de composición comparte una instancia del repositorio entre registro y consulta.

```ts
import type { UserRepository } from '../../domain/repositories/user.repository.ts';

export class RegisterUserUseCase {
  private readonly repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  // execute coordina la creación, la consulta y el guardado.
}
```

## Payments muestra el flujo HTTP completo

1. `POST /payments` pasa por el router. El middleware exige JSON, limita y parsea el cuerpo y aplica el esquema Zod antes de llamar a `RegisterPaymentController.handle`.
2. El controlador entrega los datos a `RegisterPaymentUseCase.execute`, que acepta el tipo interior `CreatePaymentData`. `Payment.create` normaliza la referencia y protege invariantes como el monto positivo incluso si se llama al caso de uso fuera de HTTP.
3. El caso de uso consulta por referencia y guarda mediante `PaymentRepository`. `InMemoryPaymentRepository` implementa las operaciones y rechaza referencias o IDs repetidos en la escritura.
4. El router responde con 201 y serializa el resultado. Los errores conocidos se traducen en el middleware común de Express. En este proyecto, `ValidationError` produce 400, `NotFoundError` produce 404 y `ConflictError` produce 409.

Al cambiar el adaptador de pagos, preserva la ausencia como `undefined` en las búsquedas y el comportamiento observable, como el orden de creación del listado, que las pruebas actuales verifican.

## Verificación

- Las pruebas de entidades cubren invariantes y normalización. Las de casos de uso de usuarios ejercitan el contrato con dobles y verifican efectos como evitar una escritura tras detectar un duplicado.
- Las pruebas de repositorio verifican consultas y conflictos. Las pruebas HTTP de pagos levantan la app mediante `createApp()` en un puerto efímero y cubren el registro, las consultas, los conflictos y los cuerpos inválidos.
- En `clean-backend`, ejecuta `npm test` y `npx tsc --noEmit` al cambiar TypeScript.
