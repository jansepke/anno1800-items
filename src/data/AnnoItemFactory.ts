import { rarities, upgrades } from "../anno-config.json";
import { AnnoItem, EffectTarget } from "./AnnoItem";

export default class AnnoItemFactory {
  private translations: { [key: number]: string };
  private effectTargetPoolById: { [key: number]: any };
  private rewardPoolById: { [key: number]: any };

  constructor(
    translations: { [key: number]: string },
    effectTargetPoolById: { [key: number]: any },
    rewardPoolById: { [key: number]: any }
  ) {
    this.translations = translations;
    this.effectTargetPoolById = effectTargetPoolById;
    this.rewardPoolById = rewardPoolById;
  }

  public newAnnoItem(asset: any): AnnoItem {
    const values = asset.Values;

    const rarity = values.Item.Rarity?.toLowerCase() || rarities[0].key;
    const iconPath = values.Standard.IconFilename.replace(
      "data/ui/2kimages/",
      "/img/"
    ).replace(".png", "_0.png");

    return {
      id: values.Standard.GUID,
      name: this.translations[values.Standard.GUID],
      icon: iconPath,
      effectTargets: this.resolveEffectTarget(values),
      rarity: rarity,
      rarityLabel: this.translations[
        rarities.find((r) => r.key === rarity)?.labelId as number
      ],
      upgrades: this.getUpgrades(values),
    };
  }

  private resolveEffectTarget(values: any): EffectTarget[] {
    let effectTargets = values.ItemEffect.EffectTargets.Item;

    if (!Array.isArray(effectTargets)) {
      effectTargets = [effectTargets];
    }

    return effectTargets
      .flatMap((target: any) => {
        const effectTargetPool = this.effectTargetPoolById[target.GUID];
        if (!effectTargetPool) {
          return [
            {
              label: this.translations[target.GUID],
              visible: true,
            },
          ];
        }

        let effectTargets =
          effectTargetPool.Values.ItemEffectTargetPool.EffectTargetGUIDs.Item;
        if (!Array.isArray(effectTargets)) {
          effectTargets = [effectTargets];
        }

        return [
          {
            label: this.translations[target.GUID],
            visible: true,
          },
          ...effectTargets.map((et: any) => ({
            label: this.translations[et.GUID],
            visible: false,
          })),
        ];
      })
      .filter((target: EffectTarget) => target.label);
  }

  private getUpgrades(values: any) {
    return Object.entries(values)
      .filter(([key, value]) => key.includes("Upgrade") && value !== "")
      .flatMap(([, value]: any[]) =>
        Object.entries(value).map(([upgradeKey, v]: [string, any]) => ({
          key: upgradeKey,
          label:
            this.translations[
              upgrades.find((u) => u.key === upgradeKey)?.labelId || 0
            ] || upgradeKey,
          value: this.translateValue(upgradeKey, v),
        }))
      )
      .filter(
        (upgrade) => upgrade.key !== "PublicServiceNoSatisfactionDistance"
      );
  }

  private translateValue(upgradeKey: string, value: any): any {
    if (upgradeKey === "GenPool") {
      const genPool = this.rewardPoolById[value];
      if (!genPool) {
        return [value];
      }
      let products = genPool.Values.RewardPool.ItemsPool.Item;
      if (!Array.isArray(products)) {
        products = [products];
      }

      return products.map((p: any) => this.translations[p.ItemLink]);
    }

    if (
      typeof value === "number" &&
      value >= 10000 &&
      this.translations[value]
    ) {
      return this.translations[value];
    }

    if (
      typeof value === "object" &&
      typeof value.Item === "object" &&
      !Array.isArray(value.Item)
    ) {
      value.Item = [value.Item];
    }

    if (typeof value === "object" && Array.isArray(value.Item)) {
      for (const item of value.Item) {
        for (const property in item) {
          const value = item[property];

          if (
            typeof value === "number" &&
            value >= 10000 &&
            this.translations[value]
          ) {
            item[property] = this.translations[value];
          }
        }
      }
    }

    return value;
  }
}