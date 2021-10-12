import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import {
    SlormancerCharacterModifierService,
} from 'src/app/modules/slormancer/services/slormancer-character.modifier.service';

import {
    AbstractUnsubscribeComponent,
} from '../../../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../../../shared/services/planner.service';
import {
    ANCESTRAL_LEGACY_REALMS,
    INITIAL_NODES,
} from '../../../../../slormancer/constants/content/data/data-ancestral-legacy-zones';
import { Character } from '../../../../../slormancer/model/character';
import { AncestralLegacy } from '../../../../../slormancer/model/content/ancestral-legacy';
import { MinMax } from '../../../../../slormancer/model/minmax';
import { SlormancerDataService } from '../../../../../slormancer/services/content/slormancer-data.service';
import { list } from '../../../../../slormancer/util/math.util';
import { isFirst, valueOrDefault, valueOrNull } from '../../../../../slormancer/util/utils';


interface Position { x: number; y: number; }

interface LineShape {
    style: { [key: string]: string }
}

interface ZoneShape {
    style: { [key: string]: string };
    large: boolean;
    realmId: number;
    color: number;
    ancestralLegacies: Array<number>;
    iconStyle: { [key: string]: string };
}

interface NodeShape {
    style: { [key: string]: string },
    nodeId: number;
}


@Component({
  selector: 'app-ancestral-legacy-map',
  templateUrl: './ancestral-legacy-map.component.html',
  styleUrls: ['./ancestral-legacy-map.component.scss']
})
export class AncestralLegacyMapComponent extends AbstractUnsubscribeComponent implements OnInit {

    @Input()
    public selectedAncestralLegacy: AncestralLegacy | null = null;

    @Output()
    public selectedAncestralLegacyChange = new EventEmitter<AncestralLegacy>()

    private readonly BOUNDS_X: MinMax = { min: -200, max: 200 };
    
    private readonly BOUNDS_Y: MinMax = { min: -200, max: 200 };

    private availableNodes: Array<number> = [];

    private activeRealms: Array<number> = [];

    public weldingShapes: Array<LineShape> = [];

    public lineShapes: Array<LineShape> = [];

    public zoneShapes: Array<ZoneShape> = [];

    public nodeShapes: Array<NodeShape> = [];

    public character: Character | null = null;

    public position: Position = { x: 0, y: 0 };

    public scale: number = 2;

    public grabbed = false;

    @HostListener('wheel', ['$event'])
    public onWheelUp(event: WheelEvent) {
        this.scale = Math.max(1, Math.min(2, this.scale + (event.deltaY > 0 ? -0.2 : 0.2)));
        return false;
    }

    @HostListener('mousedown')
    public onMouseDown() {
        this.grabbed = true;
    }

    @HostListener('mouseup')
    @HostListener('mouseleave')
    public onMouseUp() {
        this.grabbed = false;
    }

    @HostListener('mousemove', ['$event'])
    public onMouseMouve(event: MouseEvent) {
        if (this.grabbed) {
            this.position.x = Math.min(this.BOUNDS_X.max, Math.max(this.BOUNDS_X.min, this.position.x + event.movementX));
            this.position.y = Math.min(this.BOUNDS_Y.max, Math.max(this.BOUNDS_Y.min, this.position.y + event.movementY));
        }
    }

    constructor(private plannerService: PlannerService,
                private slormancerDataService: SlormancerDataService,
                private slormancerCharacterModifierService: SlormancerCharacterModifierService) {
        super();
        this.drawMap();
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => {
                this.character = character;
                this.updateMap();
            });
    }

    private drawMap() {
        
        // layer 1
        this.addLineShapes(5, -90, 37, 50);
        this.addZoneShapes(list(0, 9), -90 + 360 / 20, 75);
        this.addWeldinghapes(5, -90, 67, 16);
        this.addWeldinghapes(5, -90 + 360 / 10, 72, 8);
        this.addNodeShapes(list(0, 9), -90 + 360 / 20, 52);

        // layer 2
        this.addNodeShapes(list(0, 9).map(i => 10 + i * 2), -90 + 360 / 50, 92);
        this.addNodeShapes(list(0, 9).map(i => 11 + i * 2), -90 + 4 * 360 / 50, 92);
        this.addZoneShapes(list(10, 19), -90 + 360 / 10, 112);
        
        // layer 3
        this.addZoneShapes(list(20, 29), -90 + 360 / 20, 150, true);
        this.addLineShapes(10, -90 + 360 / 20, 106, 16);
        this.addNodeShapes(list(0, 9).map(i => 31 + i * 3), -90 + 360 / 20, 120);
        this.addNodeShapes(list(80, 89), -90 + 360 / 40, 127); // unreachable
        this.addNodeShapes(list(80, 89), -90 + 3 * 360 / 40, 127); // unreachable
    }

    private updateMap() {
        
        this.availableNodes = [];
        this.activeRealms = [];
        if (this.character !== null) {
            const selectedNodes = this.character !== null ? this.character.ancestralLegacies.activeNodes : [];
            const activeRealms = ANCESTRAL_LEGACY_REALMS
                .filter(realm => realm.nodes.find(node => selectedNodes.indexOf(node) !== -1) !== undefined);
                
            if (this.character.ancestralLegacies.activeNodes.length < this.character.ancestralLegacies.maxAncestralLegacy) {
                this.availableNodes = [...INITIAL_NODES, ...activeRealms.map(realm => realm.nodes).flat()].filter(isFirst);
            }

            this.activeRealms = activeRealms.map(realm => realm.realm);

        }
    }

    public isNodeActive(nodeId: number): boolean {
        return this.character !== null && this.character.ancestralLegacies.activeNodes.indexOf(nodeId) !== -1;
    }

    public isRealmActive(realmId: number): boolean {
        return this.activeRealms.indexOf(realmId) !== -1;
    }

    public isNodeAvailable(nodeId: number): boolean {
        return this.availableNodes.indexOf(nodeId) !== -1;
    }

    public isNodeSelected(nodeId: number): boolean {
        return this.selectedAncestralLegacy !== null && this.selectedAncestralLegacy.id === nodeId;
    }

    public isAncestralLegacyEquipped(ancestralLegacyId: number): boolean {
        return this.character !== null && this.character.ancestralLegacies.activeAncestralLegacies.indexOf(ancestralLegacyId) !== -1;
    }

    public getAncestralLegacy(ancestralLegacyId: number): AncestralLegacy | null {
        let result: AncestralLegacy | null = null;
        
        if (this.character !== null) {
            result = valueOrNull(this.character.ancestralLegacies.ancestralLegacies.find(ancestralLegacy => ancestralLegacy.id == ancestralLegacyId));
        }

        return result;
    }

    public toggleNode(nodeId: number) {

        if (this.character !== null) {
            let changed = false;

            if (this.isNodeActive(nodeId)) {
                changed = this.slormancerCharacterModifierService.disableAncestralLegacyNode(this.character, nodeId);
            } else {
                changed = this.slormancerCharacterModifierService.activateAncestralLegacyNode(this.character, nodeId);
            }
            this.plannerService.updateCurrentCharacter();
    
            if (changed) {
                this.updateMap();
            }
        }

        return false;
    }

    public selectAncestralLegacy(ancestralLegacy: AncestralLegacy) {
        this.selectedAncestralLegacyChange.emit(ancestralLegacy);
    }

    private addLineShapes(quantity: number, baseAngle: number, distance: number, length: number) {
        const angle = 360 / quantity;

        this.lineShapes.push(...list(quantity)
            .map(i => ({ style: { width: length + 'px', transform: 'translate(-50%, -50%) rotate(' + (baseAngle + i * angle) + 'deg) translateX(' + distance + 'px)' } })));
    }

    private addWeldinghapes(quantity: number, baseAngle: number, distance: number, length: number) {
        const angle = 360 / quantity;

        this.weldingShapes.push(...list(quantity)
            .map(i => ({ style: { width: length + 'px', transform: 'translate(-50%, -50%) rotate(' + (baseAngle + i * angle) + 'deg) translateX(' + distance + 'px)' } })));
    }

    private addZoneShapes(realms: Array<number>, baseAngle: number, distance: number, large: boolean = false) {
        const angle = 360 / realms.length;

        this.zoneShapes.push(...realms
            .map((realmId, index) => {
                const color = this.slormancerDataService.getAncestralRealmColor(realmId);
                const ancestralLegacies = this.slormancerDataService.getAncestralLegacyIdsFromRealm(realmId);
                const finalAngle = baseAngle + index * angle;
                
                return {
                    style: { transform: 'translate(-50%, -50%) rotate(' + finalAngle + 'deg) translateX(' + distance + 'px)' },
                    iconStyle: { transform: 'rotate(' + -finalAngle + 'deg)' },
                    large,
                    realmId,
                    ancestralLegacies,
                    color
                };
            }));
    }

    private addNodeShapes(nodes: Array<number>, baseAngle: number, distance: number) {
        const quantity = nodes.length;
        const angle = 360 / quantity;

        this.nodeShapes.push(...list(quantity).map(i => ({
                style: { transform: 'translate(-50%, -50%) rotate(' + (baseAngle + i * angle) + 'deg) translateX(' + distance + 'px)' },
                nodeId: valueOrDefault(nodes[i], 0)
            })));
    }
}
