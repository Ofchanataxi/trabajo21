import { EmailStrategy } from './Strategies/EmailStrategy';
import { NodemailerStrategy } from './Strategies/NodemailerStrategy';
import { Office365Strategy } from './Strategies/Office365Strategy';

export class EmailClientFactory {
  static createClient(): EmailStrategy {
    // Aquí podrías añadir lógica para elegir diferentes estrategias
    //return new NodemailerStrategy();
    return new Office365Strategy();
  }
}
