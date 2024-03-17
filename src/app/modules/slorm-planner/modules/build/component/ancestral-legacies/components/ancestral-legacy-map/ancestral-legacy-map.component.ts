import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AbstractUnsubscribeComponent } from '@shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { BuildStorageService } from '@shared/services/build-storage.service';
import { takeUntil } from 'rxjs/operators';
import {
    AncestralLegacy,
    Character,
    list,
    MinMax,
    SlormancerAncestralLegacyNodesService,
    SlormancerCharacterModifierService,
    SlormancerDataService,
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

    public scale: number = 1;

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
                private slormancerCharacterModifierService: SlormancerCharacterModifierService,
                private slormancerAncestralLegacyNodesService: SlormancerAncestralLegacyNodesService) {
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
        this.addNodeShapes([154, 142, 145, 148, 151], -116.5, 246);
        this.addNodeShapes([141, 144, 147, 150, 153], -90 + 360 / 10, 279.5);
        this.addNodeShapes([140, 143, 146, 149, 152], -63.5, 246);
        
        // layer 8
        this.addZoneShapes(list(22, 26).map(i => i * 3), -90 + 360 / 10 + 2 - 360 / 20, 258, 2);
        this.addNodeShapes([113, 119, 125, 131, 137], -90 + 360 / 10 + 1.5 - 360 / 20, 228);
        this.addZoneShapes(list(22, 26).map(i => i * 3 + 1), -90 + 360 / 10 - 2 + 360 / 20, 258, 2);
        this.addNodeShapes([114, 120, 126, 132, 138], -90 + 360 / 10 - 1.5 + 360 / 20, 228);
        
        this.addNodeShapes([157, 168, 178, 190, 201], -104.5, 277);
        this.addNodeShapes([155, 166, 177, 188, 199], -109.5, 290);
        this.addNodeShapes([163, 174, 185, 196, 207], -75.5, 277);
        this.addNodeShapes([165, 176, 187, 198, 209], -69.8, 289);

        // layer 9
        this.addZoneShapes([65, 68, 71, 74, 77], -90, 256);
        this.addZoneShapes([83, 86, 89, 92, 80], -4 - 360 / 15, 293);
        this.addZoneShapes([82, 85, 88, 91, 94], -90 + 5 + 360 / 70, 293);

        this.addLineShapes(5, -100, 252, 37);
        this.addWeldinghapes(5, -99.7, 234.2, 1.5);
        
        this.addLineShapes(5, -80, 252, 37);
        this.addWeldinghapes(5, -80.3, 234.2, 1.5);
        
        this.addNodeShapes([110, 116, 122, 128, 134], -93, 236);
        this.addNodeShapes([111, 117, 123, 129, 135], -87, 236);

        this.addNodeShapes([158, 169, 180, 191, 202], -100, 270);
        this.addNodeShapes([162, 173, 183, 195, 206], -80, 266);

        // layer 10
        this.addZoneShapes([96, 99, 102, 105, 108], -90 + 360 / 10, 310, 2);

        // layer 11
        this.addZoneShapes([95, 98, 101, 104, 107]  , -90 + 360 / 10 + 2 - 360 / 20, 320, 2);
        this.addNodeShapes([164, 175, 186, 197, 208], -90 + 360 / 10 - 3 - 360 / 20, 304);
        this.addZoneShapes([97, 100, 103, 106, 109] , -90 + 360 / 10 - 2 + 360 / 20, 320, 2);
        this.addNodeShapes([167, 179, 189, 200, 156], -90 + 360 / 10 + 360 / 20 + 3.5, 304);

        // layer 12
        this.addZoneShapes([81, 84, 87, 90, 93], -90, 304, 1);
        this.addNodeShapes([160, 171, 182, 193, 204], -90, 280);
        this.addNodeShapes([161, 172, 184, 194, 205], -85, 300);
        this.addNodeShapes([159, 170, 181, 192, 203], -95, 300);

        // layer 13
        this.addZoneShapes([110, 111, 112, 113, 114], -90, 361, 2);
        this.addNodeShapes([300, 301, 302, 303, 304], -90, 329);

        // layer 14 / Permanent Overload / Renewal of Justice / Blorm Up! / Heat Wave / Shattering Ice
        this.addZoneShapes([117, 122, 127, 132, 137], -90 + 360 / 10, 370, 1);
        this.addNodeShapes([215, 225, 235, 245, 255], -90 + 360 / 10, 343);

        // layer 15 / Blazing Fireball / Winds of Winter / Consistency is Key / The Judge of Light / Avatar of Shadow
        this.addZoneShapes([118, 123, 128, 133, 138], -90 + 360 / 10 + 11, 370, 1);
        this.addNodeShapes([216, 226, 236, 246, 256], -90 + 360 / 10 + 7, 370);
        this.addNodeShapes([217, 227, 237, 247, 257], -90 + 360 / 10 + 13, 348);

        // layer 16 / Lowey's Gratitude / Frozen Arrows / Static Shock / Light Diffusion / Elemental Pact
        this.addZoneShapes([116, 121, 126, 131, 136], -90 + 360 / 10 - 11, 370, 1);
        this.addNodeShapes([214, 224, 234, 244, 254], -90 + 360 / 10 - 7, 370);
        this.addNodeShapes([213, 223, 233, 243, 253], -90 + 360 / 10 - 13, 348);

        // layer 17 / Warlock's Ascendancy / Elemental Rogue / Ancestral Instability / Wrath of Kings / Blorm Empire
        this.addZoneShapes([119, 124, 129, 134, 139], -90 + 360 / 5 - 15, 370, 1);
        this.addNodeShapes([218, 228, 238, 248, 258], -90 + 360 / 5 - 17, 347);
        this.addNodeShapes([305, 306, 307, 308, 309], -90 + 360 / 5 - 11, 370);

        // layer 18 / Lowey's Creation / Frost Sentinel / Gift of Ancestral Speed / Last Stand / Black Pact
        this.addZoneShapes([115, 120, 125, 130, 135], -90 + 15, 370, 1);
        this.addNodeShapes([212, 222, 232, 242, 252], -90 + 17, 347);
        this.addNodeShapes([310, 311, 312, 313, 314], -90 + 11, 370);

        this.addLineShapes(5, -49.5, 354, 47, 45);
        this.addWeldinghapes(5, -52.1, 337, 1.5);
        this.addLineShapes(5, 85.5, 354, 47, -45);
        this.addWeldinghapes(5, 88.1, 337, 1.5);

        this.addLineShapes(5, -11, 343.1, 66, 45);
        this.addWeldinghapes(5, -15, 320, 2);
        this.addLineShapes(5, -25, 343.1, 66, -45);
        this.addWeldinghapes(5, -21, 320, 2);
    }

    private updateMap() {
        this.availableNodes = [];
        this.activeRealms = [];
        if (this.character !== null) {
            this.availableNodes = this.slormancerAncestralLegacyNodesService.getAvailableEmptyNodes(this.character);
            this.activeRealms = this.slormancerAncestralLegacyNodesService.getActiveRealms(this.character)
                .map(realm => realm.realm);
        }
    }

    public isNodeActive(nodeId: number): boolean {
        return this.character !== null && this.character.ancestralLegacies.activeNodes.indexOf(nodeId) !== -1;
    }

    public isFirstNodeActive(nodeId: number): boolean {
        return this.character !== null && this.character.ancestralLegacies.activeFirstNode === nodeId;
    }

    public isRealmActive(realmId: number): boolean {
        return this.activeRealms.indexOf(realmId) !== -1;
    }

    public isNodeAvailable(nodeId: number): boolean {
        return this.availableNodes.indexOf(nodeId) !== -1;
    }

    public isFirstNodeAvailable(): boolean {
        return this.character !== null && this.character.ancestralLegacies.activeFirstNode === null;
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

            changed = this.slormancerCharacterModifierService.toggleAncestralLegacyNode(this.character, nodeId);
            this.buildStorageService.saveLayer();
    
            if (changed) {
                this.updateMap();
            }
        }
    }

    public selectAncestralLegacy(ancestralLegacy: AncestralLegacy) {   
        this.selectedAncestralLegacyChange.emit(ancestralLegacy);
    }

    private addLineShapes(quantity: number, baseAngle: number, distance: number, length: number, rotation: number = 0) {
        const angle = 360 / quantity;

        this.lineShapes.push(...list(quantity)
            .map(i => ({ style: { width: length + 'px', transform: 'translate(-50%, -50%) rotate(' + (baseAngle + i * angle) + 'deg) translateX(' + distance + 'px) rotate(' + rotation + 'deg)' } })));
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
                const ancestralLegacies = this.slormancerAncestralLegacyNodesService.getAncestralLegacyIdsFromRealm(realmId);
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
