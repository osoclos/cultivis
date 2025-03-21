import type { GuardDataJSON, HereticDataJSON, MachineDataJSON, OccultistDataJSON, SoldierDataJSON } from "../../../types";

import soldierDataJSON from "./soldier-data.json";
import occultistDataJSON from "./occultist-data.json";
import guardDataJSON from "./guard-data.json";

import hereticDataJSON from "./heretic-data.json";
import machineDataJSON from "./machine-data.json";

const soldierData: SoldierDataJSON = soldierDataJSON;
const occultistData: OccultistDataJSON = occultistDataJSON;
const guardData: GuardDataJSON = guardDataJSON;

const hereticData: HereticDataJSON = hereticDataJSON;
const machineData: MachineDataJSON = machineDataJSON;

export { soldierData, occultistData, guardData, hereticData, machineData };