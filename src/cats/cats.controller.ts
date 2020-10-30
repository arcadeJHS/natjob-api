import { Controller, Get } from '@nestjs/common';

interface cat { name: string, age: number };

const cats: cat[] = [
  { name: "Nata", age: 36 },
  { name: "Birba", age: 15 }
];

// basic route: /cats
@Controller('cats')
export class CatsController {

  // path: /cats
  @Get()
  findAll(): cat[] {
    return cats;
  }

  // path: /cats/first
  @Get('first')
  findFirst(): cat {
    return cats[0];
  }

}
