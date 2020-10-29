import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Image from "next/image";
import React from "react";
import { AnnoItem } from "../data/AnnoItem";

const renderPercentage = [
  "ConstructionCostInPercent",
  "AttackSpeedUpgrade",
  "GenProbability",
  "TaxModifierInPercent",
  "WorkforceModifierInPercent",
  "ModuleLimitPercent",
];

const renderBoolean = [
  "BlockHostileTakeover",
  "BlockBuyShare",
  "HappinessIgnoresMorale",
  "ProvideIndustrialization",
];

const renderUpgradeItem = (key: string, item: any) => {
  switch (key) {
    case "ReplaceInputs":
      return `${item.OldInput} -> ${item.NewInput}`;
    case "AdditionalOutput":
      return `1/${item.AdditionalOutputCycle} ${item.Product}`;
    case "InputAmountUpgrade":
      return `${item.Amount} ${item.Product}`;

    default:
      return JSON.stringify(item);
  }
};

const renderUpgrade = (upgrade: any) => {
  if (upgrade.value.Value) {
    return `${upgrade.key}: ${upgrade.value.Value}${
      upgrade.value.Percental === 1 ? "%" : ""
    }`;
  }

  if (renderBoolean.includes(upgrade.key)) {
    return upgrade.key;
  }

  if (renderPercentage.includes(upgrade.key)) {
    return `${upgrade.key}: ${upgrade.value}%`;
  }

  if (upgrade.key === "DamageReceiveFactor") {
    return `${upgrade.key}: ${(1 - upgrade.value.Normal.Factor) * 100}%`;
  }

  if (typeof upgrade.value === "string" || typeof upgrade.value === "number") {
    return `${upgrade.key}: ${upgrade.value}`;
  }

  if (upgrade.value.Item) {
    return `${upgrade.key}: ${upgrade.value.Item.map((item: any) =>
      renderUpgradeItem(upgrade.key, item)
    ).join(", ")}`;
  }

  return JSON.stringify(upgrade);
};

const ItemTableRow = ({ item }: { item: AnnoItem }) => {
  return (
    <TableRow hover={true}>
      <TableCell>
        <Image src={item.icon} width={20} height={20} />
      </TableCell>
      <TableCell>{item.name}</TableCell>
      <TableCell>{item.type}</TableCell>
      <TableCell>{item.rarity}</TableCell>
      <TableCell>{item.effectTargets.join(", ")}</TableCell>
      <TableCell>
        {item.upgrades.map((upgrade) => (
          <span key={upgrade.key}>
            {renderUpgrade(upgrade)}
            <br />
          </span>
        ))}
      </TableCell>
    </TableRow>
  );
};

export default ItemTableRow;
