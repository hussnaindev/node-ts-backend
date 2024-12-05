import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

class Swagger {
  private static instance: Swagger;
  public swaggerSpec: ReturnType<typeof swaggerJSDoc>;

  private constructor() {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'API Documentation',
          version: '1.0.0',
          description: 'Documentation for the API',
        },
        servers: [
          {
            url: '/api/v1',
            description: 'Development Server',
          },
        ],
      },
      apis: ['./dist/controllers/**/*.js'], // Adjust path as necessary
    };

    this.swaggerSpec = swaggerJSDoc(swaggerOptions);
  }

  public static getInstance(): Swagger {
    if (!Swagger.instance) {
      Swagger.instance = new Swagger();
    }
    return Swagger.instance;
  }

  public setupSwaggerUi(app: any): void {
    app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(this.swaggerSpec, { explorer: true }));
  }
}

export default Swagger;
