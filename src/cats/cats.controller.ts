import { Controller, Get } from '@nestjs/common';

interface cat { name: string, age: number };

const cats: cat[] = [
  { name: "Kitty", age: 5 },
  { name: "Birba", age: 15 },
  { name: "Nat", age: 36 },
  { name: "DimonniCat", age: 13 },
  { name: "Another Cat", age: 777 }
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
