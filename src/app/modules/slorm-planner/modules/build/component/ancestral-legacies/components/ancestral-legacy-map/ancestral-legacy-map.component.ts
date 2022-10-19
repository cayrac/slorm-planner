import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AbstractUnsubscribeComponent } from '@shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { BuildStorageService } from '@shared/services/build-storage.service';
import { takeUntil } from 'rxjs/operators';
import {
    ANCESTRAL_LEGACY_REALMS,
    AncestralLegacy,
    Character,
    INITIAL_NODES,
    isFirst,
    list,
    MinMax,
    SlormancerCharacterModifierService,
    SlormancerDataService,
    UNLOCKED_ANCESTRAL_LEGACY_POINTS,
    valueOrDefault,
    valueOrNull,
} from 'slormancer-api';


interface Position { x: number; y: number; }

interface LineShape {
    style: { [key: string]: string }
}

interface ZoneShape {
    style: { [key: string]: string };
    size: number;
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

    private readonly BOUNDS_X: MinMax = { min: -500, max: 500 };
    
    private readonly BOUNDS_Y: MinMax = { min: -500, max: 500 };

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

    constructor(private buildStorageService: BuildStorageService,
                private slormancerDataService: SlormancerDataService,
                private slormancerCharacterModifierService: SlormancerCharacterModifierService) {
        super();
        this.drawMap();
    }

    public ngOnInit() {
        this.buildStorageService.layerChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(layer => {
                this.character = layer === null ? null : layer.character;
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
        this.addZoneShapes(list(20, 29), -90 + 360 / 20, 150, 2);
        this.addLineShapes(10, -90 + 360 / 20, 106, 16);
        this.addNodeShapes(list(0, 9).map(i => 31 + i * 3), -90 + 360 / 20, 120);
        this.addNodeShapes(list(10, 19).map(i => i * 3), -90 + 360 / 40, 127);
        this.addNodeShapes(list(10, 19).map(i => 2 + i * 3), -90 + 3 * 360 / 40, 127);
        
        // layer 4
        this.addZoneShapes(list(30, 39), -90, 173);
        this.addNodeShapes([60, 63, 65, 68, 70, 73, 75, 78, 80, 83], -90 + 2 - 360 / 40, 160);
        this.addNodeShapes(list(0, 4).map(i => 61 + i * 5), -90, 150);
        this.addNodeShapes([62, 64, 67, 69, 72, 74, 77, 79, 82, 84], -90 - 2 + 360 / 40, 160);
        this.addLineShapes(5, -90, 140, 10);

        // layer 5
        this.addZoneShapes([41, 45, 49, 53, 57], -90 + 1 + 360 / 20, 204);
        this.addZoneShapes([42, 46, 50, 54, 58], -1 - 360 / 10, 204);
        this.addNodeShapes([87, 89, 92, 94, 97, 99, 102, 104, 107, 109], -90 + 360 / 20, 181);

        // layer 6
        this.addZoneShapes(list(10, 14).map(i => i * 4 + 3), -0.5 - 360 / 15, 216);
        this.addNodeShapes([90, 95, 100, 105, 85], 2 - 360 / 15, 194);
        this.addNodeShapes([115, 121, 127, 133, 139], -6.5 - 360 / 15, 209);
        this.addZoneShapes(list(10, 14).map(i => i * 4), -90 + 1.5 + 360 / 70, 216);
        this.addNodeShapes([86, 91, 96, 101, 106], -90 + -1.5 + 360 / 70, 194);
        this.addNodeShapes([112, 118, 124, 130, 136], -90 + 7.5 + 360 / 70, 209);

        // layer 7
        this.addZoneShapes(list(60, 64), -90 + 360 / 10, 238, 3);
        this.addNodeShapes([88, 93, 98, 103, 108], -90 + 360 / 10, 198);
        
        // layer 8
        this.addZoneShapes(list(22, 26).map(i => i * 3), -90 + 360 / 10 + 2 - 360 / 20, 258, 2);
        this.addNodeShapes([113, 119, 125, 131, 137], -90 + 360 / 10 + 1.5 - 360 / 20, 228);
        this.addZoneShapes(list(22, 26).map(i => i * 3 + 1), -90 + 360 / 10 - 2 + 360 / 20, 258, 2);
        this.addNodeShapes([114, 120, 126, 132, 138], -90 + 360 / 10 - 1.5 + 360 / 20, 228);

        /*
        { nodes: [86, 112], realm: 40 },   // Optimal Path
        { nodes: [90, 115], realm: 43 },   // Burning Rage
        { nodes: [91, 118], realm: 44 },   // Elemental Sorcerer
        { nodes: [95, 121], realm: 47 },   // Tower Defense
        { nodes: [96, 124], realm: 48 },   // Relentless
        { nodes: [100, 127], realm: 51 },  // Kah Rooj's Power Plant
        { nodes: [101, 130], realm: 52 },  // Shield of the Champion of Light
        { nodes: [105, 133], realm: 55 },  // Glittering Silence
        { nodes: [106, 136], realm: 56 },  // Ancestral Backlash
        { nodes: [85, 139], realm: 59 },   // Shadow Spawn
        */
    }

    private updateMap() {
        
        this.availableNodes = [];
        this.activeRealms = [];
        if (this.character !== null) {
            const selectedNodes = this.character !== null ? this.character.ancestralLegacies.activeNodes : [];
            const activeRealms = ANCESTRAL_LEGACY_REALMS
                .filter(realm => realm.nodes.find(node => selectedNodes.indexOf(node) !== -1) !== undefined);
                
            if (this.character.ancestralLegacies.activeNodes.length < UNLOCKED_ANCESTRAL_LEGACY_POINTS) {
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
            this.buildStorageService.saveLayer();
    
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

    private addZoneShapes(realms: Array<number>, baseAngle: number, distance: number, size: number = 1) {
        const angle = 360 / realms.length;

        this.zoneShapes.push(...realms
            .map((realmId, index) => {
                const color = this.slormancerDataService.getAncestralRealmColor(realmId);
                const ancestralLegacies = this.slormancerDataService.getAncestralLegacyIdsFromRealm(realmId);
                const finalAngle = baseAngle + index * angle;
                
                return {
                    style: { transform: 'translate(-50%, -50%) rotate(' + finalAngle + 'deg) translateX(' + distance + 'px)' },
                    iconStyle: { transform: 'rotate(' + -finalAngle + 'deg)' },
                    size,
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
