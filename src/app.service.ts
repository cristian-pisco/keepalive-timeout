import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    await this.sleep(1000);
    return 'Hello World!';
  }
  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
