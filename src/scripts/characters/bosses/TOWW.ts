import type { TOWW_Id } from "../../../data/types";
import { Actor, type ActorObject } from "../../Actor";

const TYPE: string = "toww";

export class TOWW extends Actor implements TOWW_Object {
    static readonly BISHOP_CROWN_SKIN_NAME: string = "Crown";
    static readonly BISHOP_NO_CROWN_SKIN_NAME: string = "NoCrown";
    static readonly BISHOP_NO_CHAINS_SKIN_NAME: string = "NoChains";

    static readonly BOSS_CROWN_SKIN_NAME: string = "Crown";
    static readonly BOSS_NO_CROWN_SKIN_NAME: string = "default";

    static readonly MEGA_BOSS_EYE_STAGES_SKIN_NAME: string[] = ["all", "1", "2", "3"];

    static readonly EYEBALL_NORMAL_SKIN_NAME: string = "Normal";
    static readonly EYEBALL_INJURED_SKIN_NAME: string = "Hurt";

    #hasCrown: boolean | null;
    #hasChains: boolean | null;

    #eyeState: number | null;
    #isInjured: boolean | null;

    constructor(skeletonData: spine.SkeletonData, atlas: spine.TextureAtlas, id?: string, label: string = "The One Who Waits", readonly form: TOWW_Id = "Bishop") {
        super(skeletonData, atlas, id, label);

        this.#hasCrown = Array<TOWW_Id>("Bishop", "Boss").includes(form) ? true : null;
        this.#hasChains = form === "Bishop" ? true : null;

        this.#eyeState = form === "Mega_Boss" ? 0 : null;
        this.#isInjured = form === "Eyeball" ? false : null;

        this.update();
    }

    get hasCrown(): boolean | null {
        return this.#hasCrown;
    }

    set hasCrown(hasCrown: boolean | null) {
        this.#hasCrown = Array<TOWW_Id>("Bishop", "Boss").includes(this.form) ? hasCrown ?? true : null;
        this.update();
    }

    get hasChains(): boolean | null {
        return this.#hasChains;
    }

    set hasChains(hasChains: boolean | null) {
        this.#hasChains = this.form === "Bishop" ? hasChains ?? true : null;
        this.update();
    }

    get eyeState(): number | null {
        return this.#eyeState;
    }

    set eyeState(state: number | null) {
        this.#eyeState = this.form === "Mega_Boss" ? state ?? 0 : null;
        this.update();
    }

    get isInjured(): boolean | null {
        return this.#isInjured;
    }

    set isInjured(isInjured: boolean | null) {
        this.#isInjured = this.form === "Eyeball" ? isInjured ?? false : null;
        this.update();
    }

    clone(id?: string, label?: string) {
        const { skeleton, atlas, form } = this;

        const toww = new TOWW(skeleton.data, atlas, id, label, form);
        toww.copyFromObj(this.toObj());

        return toww;
    }

    update() {
        const { form, hasCrown, hasChains, eyeState, isInjured } = this;
        switch (form) {
            case "Bishop": {
                this.setSkin(hasCrown ? TOWW.BISHOP_CROWN_SKIN_NAME : TOWW.BISHOP_NO_CROWN_SKIN_NAME);
                !hasChains && this.addSkins(TOWW.BISHOP_NO_CHAINS_SKIN_NAME);

                break;
            }

            case "Boss": {
                this.setSkin(hasCrown ? TOWW.BOSS_CROWN_SKIN_NAME : TOWW.BOSS_NO_CROWN_SKIN_NAME);
                break;
            }

            case "Mega_Boss": {
                this.setSkin(TOWW.MEGA_BOSS_EYE_STAGES_SKIN_NAME[eyeState!]);
                break;
            }

            case "Eyeball": {
                this.setSkin(isInjured ? TOWW.EYEBALL_INJURED_SKIN_NAME : TOWW.EYEBALL_NORMAL_SKIN_NAME);
                break;
            }
        }

        this.tick();
    }

    copyFromObj(obj: TOWW_Object) {
        const { hasCrown, hasChains, eyeState, isInjured } = obj;

        this.hasCrown = hasCrown;
        this.hasChains = hasChains;

        this.eyeState = eyeState;
        this.isInjured = isInjured;
        
        super.copyFromObj(obj);
    }
    
    toObj(): TOWW_Object {
        const { form, hasCrown, hasChains, eyeState, isInjured } = this;
        return { ...super.toObj(), type: TYPE, form, hasCrown, hasChains, eyeState, isInjured };
    }
}

export interface TOWW_Object extends ActorObject {
    form: TOWW_Id;

    hasCrown: boolean | null;
    hasChains: boolean | null;

    eyeState: number | null;
    isInjured: boolean | null;
}

export function isTOWW_Obj(obj: ActorObject): obj is TOWW_Object {
    return obj instanceof TOWW || obj.type === TYPE;
}