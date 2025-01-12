import type { NarinderId } from "../../data/types";
import { Random } from "../../utils";

import { Actor, type ActorObject } from "../Actor";

export class Narinder extends Actor implements NarinderObject {
    static readonly BISHOP_CROWN_SKIN_NAME: string = "Crown";
    static readonly BISHOP_NO_CROWN_SKIN_NAME: string = "NoCrown";
    static readonly BISHOP_NO_CHAINS_SKIN_NAME: string = "NoChains";

    static readonly BOSS_CROWN_SKIN_NAME: string = "Crown";
    static readonly BOSS_NO_CROWN_SKIN_NAME: string = "default";

    static readonly MEGA_BOSS_EYE_STAGES_SKIN_NAME: string[] = ["all", "1", "2", "3"];

    static readonly EYEBALL_NORMAL_SKIN_NAME: string = "Normal";
    static readonly EYEBALL_HURT_SKIN_NAME: string = "Hurt";

    #hasCrown: boolean | null;
    #hasChains: boolean | null;

    #eyeState: number | null;
    #isHurt: boolean | null;

    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id: string = Random.id(), label: string = "Narinder", readonly form: NarinderId = "Bishop") {
        super(skeleton, animationState, id, label);

        this.#hasCrown = Array<NarinderId>("Bishop", "Boss").includes(form) ? true : null;
        this.#hasChains = form === "Bishop" ? true : null;

        this.#eyeState = form === "Mega_Boss" ? 0 : null;
        this.#isHurt = form === "Eyeball" ? false : null;

        this.update();
    }

    get hasCrown(): boolean | null {
        return this.#hasCrown;
    }

    set hasCrown(hasCrown: boolean | null) {
        if (!Array<NarinderId>("Bishop", "Boss").includes(this.form)) return;

        this.#hasCrown = hasCrown;
        this.update();
    }

    get hasChains(): boolean | null {
        return this.#hasChains;
    }

    set hasChains(hasChains: boolean | null) {
        if (this.form !== "Bishop") return;

        this.#hasChains = hasChains;
        this.update();
    }

    get eyeState(): number | null {
        return this.#eyeState;
    }

    set eyeState(state: number | null) {
        if (this.form !== "Mega_Boss") return;

        this.#eyeState = state;
        this.update();
    }

    get isHurt(): boolean | null {
        return this.#isHurt;
    }

    set isHurt(isHurt: boolean | null) {
        if (this.form !== "Eyeball") return;

        this.#isHurt = isHurt;
        this.update();
    }

    clone(id: string = Random.id(), label: string = `${this.label} (Copy)`) {
        const { skeleton, animationState, form } = this;

        const narinder = new Narinder(new spine.Skeleton(skeleton.data), new spine.AnimationState(animationState.data), id, label, form);
        narinder.copyFromObj(this.toObj());

        return narinder;
    }

    update() {
        const { form, hasCrown, hasChains, eyeState, isHurt } = this;
        
        switch (form) {
            case "Bishop":
            case "Boss": {
                this.setSkin(hasCrown ? Narinder.BISHOP_CROWN_SKIN_NAME : Narinder.BISHOP_NO_CROWN_SKIN_NAME);
                form === "Bishop" && !hasChains && this.addSkins(Narinder.BISHOP_NO_CHAINS_SKIN_NAME);

                break;
            }

            case "Mega_Boss": {
                this.setSkin(Narinder.MEGA_BOSS_EYE_STAGES_SKIN_NAME[eyeState!]);
                break;
            }

            case "Eyeball": {
                this.setSkin(isHurt ? Narinder.EYEBALL_HURT_SKIN_NAME : Narinder.EYEBALL_NORMAL_SKIN_NAME);
                break;
            }
        }

        this.tick();
    }

    copyFromObj(obj: NarinderObject) {
        const { hasCrown, hasChains, eyeState, isHurt } = obj;

        this.hasCrown = hasCrown;
        this.hasChains = hasChains;

        this.eyeState = eyeState;
        this.isHurt = isHurt;
        
        super.copyFromObj(obj);
    }
    
    toObj(): NarinderObject {
        const { form, hasCrown, hasChains, eyeState, isHurt } = this;
        return { ...super.toObj(), type: "narinder", form, hasCrown, hasChains, eyeState, isHurt };
    }
}

export interface NarinderObject extends ActorObject {
    form: NarinderId;

    hasCrown: boolean | null;
    hasChains: boolean | null;

    eyeState: number | null;
    isHurt: boolean | null;
}

export function isNarinderObj(obj: ActorObject): obj is NarinderObject {
    return obj instanceof Narinder || obj.type === "narinder";
}