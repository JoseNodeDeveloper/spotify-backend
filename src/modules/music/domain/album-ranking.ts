import { AlbumSummary, Track } from './track';

/**
 * Core business rule of the project, written as a pure function:
 * same input, same output, no I/O. It is tested without database or network.
 *
 * 1. Keep tracks whose primary artist matches the searched artist.
 *    If there is no exact match, use the most frequent artist.
 *    (The previous version picked the first group, which could be another artist.)
 * 2. Group by album and sum track popularity.
 * 3. Sort from highest to lowest popularity; ties are resolved by album name
 *    for stable, predictable ordering.
 *
 * Complexity: O(n log n) due to sorting; grouping is O(n) using a Map.
 */
export function rankAlbumsByPopularity(tracks: readonly Track[], searchedArtist: string): AlbumSummary[] {
  const artist = resolveArtist(tracks, searchedArtist);
  if (!artist) return [];

  const albums = new Map<string, AlbumSummary>();

  for (const track of tracks) {
    if (normalize(track.primaryArtist) !== artist) continue;

    const current = albums.get(track.album.name);
    albums.set(track.album.name, {
      albumName: track.album.name,
      coverUrl: current?.coverUrl ?? track.album.coverUrl,
      releaseDate: track.album.releaseDate,
      totalTracks: track.album.totalTracks,
      popularity: (current?.popularity ?? 0) + track.popularity,
    });
  }

  return [...albums.values()].sort((a, b) => b.popularity - a.popularity || a.albumName.localeCompare(b.albumName));
}

function resolveArtist(tracks: readonly Track[], searchedArtist: string): string | null {
  const wanted = normalize(searchedArtist);
  const counts = new Map<string, number>();

  for (const track of tracks) {
    const name = normalize(track.primaryArtist);
    if (name === wanted) return wanted;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  let mostFrequent: string | null = null;
  let max = 0;
  for (const [name, count] of counts) {
    if (count > max) {
      mostFrequent = name;
      max = count;
    }
  }
  return mostFrequent;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}
