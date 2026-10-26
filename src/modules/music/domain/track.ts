/**
 * Our own track model, independent of Spotify's JSON format.
 * The Spotify adapter translates its response into this model (anti-corruption layer).
 */
export interface Track {
  readonly primaryArtist: string;
  readonly popularity: number;
  readonly album: {
    readonly name: string;
    readonly coverUrl: string | null;
    readonly releaseDate: string;
    readonly totalTracks: number;
  };
}

export interface AlbumSummary {
  readonly albumName: string;
  readonly coverUrl: string | null;
  readonly releaseDate: string;
  readonly totalTracks: number;
  /** Sum of the popularity (0-100) of the album's tracks that appear in the search. */
  readonly popularity: number;
}
