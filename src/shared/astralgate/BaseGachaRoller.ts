import { IGacha, IPlayer, GachaFreeReset, GachaReward } from '../interfaces';

import { LootTable } from 'lootastic';

export abstract class BaseGachaRoller implements IGacha {
  abstract name = '???';
  abstract desc = '???';
  abstract rewards = [];
  abstract rollCost = 999;

  requiredToken?: string;
  freeResetInterval?: GachaFreeReset;

  canRollFree(player: IPlayer): boolean {
    if(!this.freeResetInterval) return false;
    if(this.freeResetInterval === GachaFreeReset.Daily) return player.$premium.getNextFreeRoll(this.name) < Date.now();
    return false;
  }

  canRoll(player: IPlayer, numRolls = 1): boolean {
    const canRollFree = this.canRollFree(player);
    if(canRollFree) return true;

    if(this.requiredToken) {
      if(this.requiredToken === 'Gold') return player.gold >= this.rollCost * numRolls;
    }

    return player.$premium.hasILP(this.rollCost * numRolls);
  }

  getNextGachaFreeInterval(): number {
    if(this.freeResetInterval === GachaFreeReset.Daily) {
      const d = new Date();
      d.setHours(24, 0, 0, 0);
      return d.getTime();
    }

    return 0;
  }

  spendCurrency(player: IPlayer, numRolls: number): void {
    if(!this.requiredToken) {
      player.$premium.spendILP(numRolls * this.rollCost);
      return;
    }

    if(this.requiredToken === 'Gold') {
      player.spendGold(numRolls * this.rollCost);
    }
  }

  roll() {
    const table = new LootTable(this.rewards);
    return table.chooseWithReplacement(1)[0] as GachaReward;
  }

  roll10() {
    const table = new LootTable(this.rewards);
    return table.chooseWithReplacement(10) as GachaReward[];
  }
}
