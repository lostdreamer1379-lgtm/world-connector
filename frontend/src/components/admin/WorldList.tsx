import { World } from "../../types/world";
import { removeWorld } from "../../lib/api";
import ArtworkPlaceholder from "../spatial/ArtworkPlaceholder";

export default function WorldList({ worlds, token, onEdit, onRefresh }: { worlds: World[]; token: string; onEdit: (world: World) => void; onRefresh: () => void }) {
  async function remove(world: World) { if (!window.confirm(`Remove ${world.name}?`)) return; await removeWorld(token, world.id); onRefresh(); }
  return <section className="admin-card"><div className="form-heading"><div><p className="eyebrow">REGISTRY</p><h2>{worlds.length} worlds</h2></div></div><div className="world-list">{worlds.map((world) => <div className={`world-row ${!world.isActive ? "is-disabled" : ""}`} key={world.id}><div className="mini-art">{world.artworkUrl ? <img src={world.artworkUrl} alt="" /> : <ArtworkPlaceholder name={world.name} accentColor={world.accentColor} />}</div><div className="world-row-copy"><strong>{world.name}</strong><span>{world.destinationUrl}</span></div><div className="row-actions"><button className="quiet-button" onClick={() => onEdit(world)}>Edit</button><button className="danger-button" onClick={() => remove(world)}>Remove</button></div></div>)}{worlds.length === 0 && <p className="muted">No worlds yet. Add the first one.</p>}</div></section>;
}
