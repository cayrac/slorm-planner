import { Injectable } from '@angular/core';

import { ANCESTRAL_LEGACY_REALMS, INITIAL_NODES } from '../../constants/content/data/data-ancestral-legacy-realms';
import { Character, DataAncestralLegacyRealm } from '../../model';
import { isFirst, isNotNullOrUndefined } from '../../util';
import { SlormancerDataService } from './slormancer-data.service';
import { UNLOCKED_ANCESTRAL_LEGACY_POINTS } from '../../constants';

@Injectable()
export class SlormancerAncestralLegacyNodesService {

    constructor(private slormancerDataService: SlormancerDataService) { }

    public getAllActiveNodes(character: Character): Array<number> {
        return [character.ancestralLegacies.activeFirstNode, ...character.ancestralLegacies.activeNodes]
        .filter(isNotNullOrUndefined);
    }

    private isNodeConnectedToStartRecursive(nodeId: number, activeNodes: number[], visitedNodes: number[] = []): boolean {
        let connected = true;
        
        if (!INITIAL_NODES.includes(nodeId)) {
            const nodes = ANCESTRAL_LEGACY_REALMS
                .filter(realm => realm.nodes.includes(nodeId))
                .map(realm => realm.nodes)
                .flat()
                .filter((node, index, array) => isFirst(node, index, array) && activeNodes.includes(node) && !visitedNodes.includes(node));
    
    
            if (nodes.every(node => !INITIAL_NODES.includes(node))) {
                visitedNodes = [ ...nodes, ...visitedNodes ];
                connected = nodes.some(node => this.isNodeConnectedToStartRecursive(node, activeNodes, visitedNodes));
            }
        }

        return connected
    }

    public isNodeConnectedToStart(nodeId: number, character: Character): boolean {
        return this.isNodeConnectedToStartRecursive(nodeId, this.getAllActiveNodes(character));
    }

    public getActiveRealms(character: Character): DataAncestralLegacyRealm[] {
        const realms = ANCESTRAL_LEGACY_REALMS
            .filter(realm => realm.nodes.some(node => character.ancestralLegacies.activeNodes.includes(node)));
        
        if (character.ancestralLegacies.activeFirstNode !== null) {
            const firstNode = character.ancestralLegacies.activeFirstNode;
            const firstRealms = ANCESTRAL_LEGACY_REALMS
                .filter(realms => realms.nodes.includes(firstNode));
            const highestRealm = firstRealms.find(realm => firstRealms.some(frealm => frealm.realm < realm.realm))

            if (highestRealm !== undefined) {
                realms.push(highestRealm);
            }
        }

        return realms.filter(isFirst);
    }

    public getAdjacentRealms(character: Character): DataAncestralLegacyRealm[] {
        const activeRealms = this.getActiveRealms(character)
        const activeRealmNodes = activeRealms.map(realm => realm.nodes).flat();

        return ANCESTRAL_LEGACY_REALMS
            .filter(realm => realm.nodes.some(node => activeRealmNodes.includes(node)) && !activeRealms.includes(realm));
    }
    
    public getAncestralLegacyIds(character: Character): Array<number> {
        const realms = this.getActiveRealms(character);

        return this.slormancerDataService.getAncestralLegacies()
            .filter(ancestralLegacy => realms.some(realm => realm.realm === ancestralLegacy.REALM))
            .map(ancestralLegacy => ancestralLegacy.REF);
    }

    public getAncestralLegacyIdsFromRealm(realm: number): Array<number> {
        return this.slormancerDataService.getAncestralLegacies()
            .filter(ancestralLegacy => ancestralLegacy.REALM === realm)
            .map(ancestralLegacy => ancestralLegacy.REF);
    }

    public getAvailableEmptyNodes(character: Character): number[] {
        let availableEmptyNodes: number[] = [];

        if (character.ancestralLegacies.activeNodes.length < UNLOCKED_ANCESTRAL_LEGACY_POINTS) {
            const activeNodes = this.getAllActiveNodes(character)
                .filter(node => this.isNodeConnectedToStart(node, character));
            
            const possibleNodes = ANCESTRAL_LEGACY_REALMS
                .filter(realm => realm.nodes.some(node => activeNodes.includes(node)))
                .map(realm => realm.nodes)
                .flat();
    
                availableEmptyNodes = [ ...possibleNodes, ...INITIAL_NODES ]
                .filter((node, index, array) => isFirst(node, index, array) && !activeNodes.includes(node));
        }

        return availableEmptyNodes;
    }

    public getValidNodes(nodes: Array<number>): Array<number> {
        let connectedNodes = nodes.filter(node => INITIAL_NODES.indexOf(node) !== -1);
        let valid = true;

        while (connectedNodes.length < nodes.length && valid) {
            const newConnectedNodes = connectedNodes.map(node => ANCESTRAL_LEGACY_REALMS.filter(realm => realm.nodes.indexOf(node) !== -1))
                .flat()
                .map(realm => realm.nodes.filter(node => nodes.indexOf(node) !== -1))
                .flat().filter(isFirst);

            valid = connectedNodes.length < newConnectedNodes.length;
            connectedNodes = newConnectedNodes;
        }

        return connectedNodes;
    }

    public stabilize(character: Character) {
        character.ancestralLegacies.activeNodes = character.ancestralLegacies.activeNodes
            .filter((node, index, array) => isFirst(node, index, array) && this.isNodeConnectedToStart(node, character));
        if (character.ancestralLegacies.activeFirstNode !== null && character.ancestralLegacies.activeNodes.includes(character.ancestralLegacies.activeFirstNode)) {
            character.ancestralLegacies.activeFirstNode = null;
        }
    }
}