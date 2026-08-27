"use client";

import type { CSSProperties } from "react";
import type { AvatarId } from "../progress";

export type RealmWorld = {
  name: string;
  number: number;
  start: number;
  end: number;
  completed: number;
  size: number;
  projectComplete: boolean;
  unlocked: boolean;
};

type WorldMapProps = {
  paceLabel: string;
  streakDays: number;
  inventoryCount: number;
  unlockedAchievements: number;
  achievementCount: number;
  storyStep: number;
  byteStory: string[];
  world: RealmWorld | undefined;
  worldContractProgress: number;
  worldEvent: string;
  worldDescription: string;
  worldSideMissions: number;
  worlds: RealmWorld[];
  currentWorldIndex: number;
  activeAvatar: { id: AvatarId; glyph: string };
  getWorldEvent: (worldNumber: number) => string;
  onNextTransmission: () => void;
  onEnterWorld: (world: RealmWorld) => void;
};

export default function WorldMap(props: WorldMapProps) {
  return (
    <section className="realm-command-center" aria-labelledby="realm-map-title">
      <header className="realm-command-header">
        <div><p className="pixel-kicker">LIVE REALM MAP · {props.paceLabel.toUpperCase()} PATH</p><h2 id="realm-map-title">Travel through the restored worlds</h2><span>Select any unlocked world. Your checkpoints and projects visibly energize its relay.</span></div>
        <div className="game-hud"><article><small>STREAK</small><strong>{props.streakDays} DAYS</strong></article><article><small>INVENTORY</small><strong>{props.inventoryCount} ITEMS</strong></article><article><small>ACHIEVEMENTS</small><strong>{props.unlockedAchievements}/{props.achievementCount}</strong></article></div>
      </header>

      <div className="byte-comm">
        <span className="byte-comm-face">◆<small>BYTE</small></span>
        <div><p>GUIDE TRANSMISSION {props.storyStep + 1}/{props.byteStory.length}</p><strong>{props.byteStory[props.storyStep % props.byteStory.length]}</strong></div>
        <button onClick={props.onNextTransmission}>Next transmission →</button>
      </div>

      {props.world && (
        <section className="world-contract" aria-label={props.world.name + " world contract"}>
          <div className="world-contract-intro"><small>ACTIVE WORLD CONTRACT · {props.worldContractProgress}%</small><h3>{props.world.name}: {props.worldEvent}</h3><p>{props.worldDescription}</p><div role="progressbar" aria-label="World contract progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={props.worldContractProgress}><i style={{ width: props.worldContractProgress + "%" }} /></div></div>
          <ol>
            <li className={props.world.completed === props.world.size ? "done" : ""}><span>{props.world.completed === props.world.size ? "✓" : "1"}</span><p><strong>Repair knowledge nodes</strong>{props.world.completed}/{props.world.size} topic systems online</p></li>
            <li className={props.worldSideMissions > 0 ? "done" : ""}><span>{props.worldSideMissions > 0 ? "✓" : "2"}</span><p><strong>Recover a power cell</strong>{props.worldSideMissions > 0 ? props.worldSideMissions + " side mission completed" : "Complete one optional lab"}</p></li>
            <li className={props.world.projectComplete ? "done" : ""}><span>{props.world.projectComplete ? "✓" : "3"}</span><p><strong>Defeat the guardian</strong>{props.world.projectComplete ? "World relic recovered" : "Complete the required project"}</p></li>
          </ol>
        </section>
      )}

      <div className="realm-map" style={{ "--world-count": props.worlds.length } as CSSProperties}>
        <div className="realm-route" aria-hidden="true"><i style={{ width: `${props.worlds.length > 1 ? (props.currentWorldIndex / (props.worlds.length - 1)) * 100 : 100}%` }} /></div>
        {props.worlds.map((world, index) => {
          const percent = Math.round((world.completed / world.size) * 100);
          const restored = world.completed === world.size && world.projectComplete;
          const bossReady = world.completed === world.size && !world.projectComplete;
          return (
            <button className={`realm-world-node ${restored ? "restored" : bossReady ? "boss-ready" : world.unlocked ? "active" : "locked"} ${index === props.currentWorldIndex ? "player-here" : ""}`} key={world.name} onClick={() => props.onEnterWorld(world)} disabled={!world.unlocked}>
              {index === props.currentWorldIndex && <span className={`map-player ${props.activeAvatar.id}`}>{props.activeAvatar.glyph}<small>YOU</small></span>}
              <span className="world-event-tag">{props.getWorldEvent(world.number)}</span>
              <span className="realm-world-art" aria-hidden="true"><i /><i /><b>{restored ? "✓" : bossReady ? "!" : world.unlocked ? world.number : "▣"}</b></span>
              <small>WORLD {String(world.number).padStart(2, "0")}</small>
              <strong>{world.name}</strong>
              <p>{restored ? "Relay fully restored" : bossReady ? "Boss project ready" : world.unlocked ? `${world.completed}/${world.size} systems repaired` : "Locked by previous boss"}</p>
              <div><i style={{ width: `${restored ? 100 : percent}%` }} /></div>
              <em>{restored ? "EXPLORE" : bossReady ? "ENTER BOSS" : world.unlocked ? "TRAVEL" : "LOCKED"}</em>
            </button>
          );
        })}
      </div>
    </section>
  );
}
