# Integración frontend con una API

Esta estructura ilustra un módulo de pagos en el directorio de fuentes del frontend. Adapta las extensiones y nombres al framework del proyecto.

```text
src/payments/
  domain/
    entities/
      payment.entity.ts
    repositories/
      payment.repository.ts
  application/
    use-cases/
      list-payments.use-case.ts
  infrastructure/
    repositories/
      http.payment-repository.ts
  presentation/
    components/
      payments-list.tsx
```

1. `PaymentsList` solicita los pagos mediante `ListPaymentsUseCase` y muestra la carga, el resultado vacío, el listado o un error. El estado de visualización vive en presentación.
2. `ListPaymentsUseCase` depende de `PaymentRepository`. Conserva esa separación si la operación coordina reglas o si el módulo ya organiza sus acciones como casos de uso.
3. `HttpPaymentRepository` implementa el contrato con `GET /payments`. Reutiliza el cliente HTTP del proyecto y transforma la respuesta pública en los datos que consume el caso de uso. Traduce los fallos HTTP o de red para que la UI pueda mostrar un mensaje adecuado.
4. Conecta el repositorio HTTP al caso de uso cerca del punto de entrada. Por ejemplo, un proveedor de la aplicación puede crear el adaptador y entregar el caso de uso a la pantalla. Si el proyecto usa una factoría del módulo, la ruta o pantalla puede recibir las dependencias desde esa factoría. Respeta el ciclo de vida del framework al crear clientes y repositorios.

Si la pantalla registra un pago, el formulario valida los campos que captura, el adaptador envía el formato acordado con la API y el servidor decide si la operación cumple las reglas de negocio. Un conflicto de referencia del servidor se traduce en un error que la pantalla puede asociar al campo correspondiente.

Prueba el caso de uso con un repositorio doble, el adaptador con respuestas HTTP controladas y la pantalla a través de la interacción del usuario cuando cambie su comportamiento.
