# Repositorio de Infrastructure

Aquí es donde se implementan los contratos del repositorio definidos en el dominio.

`npm start` y `npm run dev` usan `SqliteUserRepository` para guardar usuarios. Al arrancar, el servidor crea la carpeta `data` si hace falta y abre o crea `data/clean-databae.sqlite` dentro del proyecto. La base conserva los usuarios entre reinicios y la tabla se crea automáticamente.

`InMemoryUserRepository` está disponible para las pruebas. Ambos repositorios implementan `UserRepository`.
