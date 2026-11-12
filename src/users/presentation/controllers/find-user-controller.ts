import type { FindUserUseCase } from "../../application/use-cases/find-user.use-case.ts";

export class FindUserController {

    private readonly findUserUseCase: FindUserUseCase;

    constructor(findUserUseCase: FindUserUseCase) {
        this.findUserUseCase = findUserUseCase;
    }

    handle(email: string) {
        return this.findUserUseCase.execute(email);
    }


}