import {
    createParamDecorator,
    ExecutionContext,
    NotFoundException,
    UnauthorizedException,
  } from '@nestjs/common';
  export const GetUser = createParamDecorator(
    async (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      const userService = ctx.switchToHttp().getResponse().locals.userService;
      const userId = request?.user?.user; // Supondo que 'user' contém o 'id' do usuário
  
      if (!userId) {
        return null
      }
  
      const user = await userService.getByUserId(userId);
  
      if (!user) {
        return null
      }
  
      return user;
    },
  );
  