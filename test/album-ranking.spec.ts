import { rankAlbumsByPopularity } from '../src/modules/music/domain/album-ranking';
import { Track } from '../src/modules/music/domain/track';

const track = (artist: string, album: string, popularity: number): Track => ({
  primaryArtist: artist,
  popularity,
  album: { name: album, coverUrl: `https://img/${album}`, releaseDate: '2020-01-01', totalTracks: 10 },
});

describe('rankAlbumsByPopularity', () => {
  it('groups by album, sums popularity, and sorts from highest to lowest', () => {
    const result = rankAlbumsByPopularity(
      [track('Rosalía', 'Motomami', 80), track('Rosalía', 'El mal querer', 70), track('Rosalía', 'Motomami', 60)],
      'rosalía',
    );

    expect(result.map((album) => [album.albumName, album.popularity])).toEqual([
      ['Motomami', 140],
      ['El mal querer', 70],
    ]);
  });

  it('ignores tracks by other artists that appear in the search', () => {
    const result = rankAlbumsByPopularity(
      [track('Another artist', 'Collaboration', 99), track('Rosalía', 'Motomami', 50)],
      'Rosalía',
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.albumName).toBe('Motomami');
  });

  it('uses the most frequent artist when none matches exactly', () => {
    const result = rankAlbumsByPopularity(
      [track('Bad Bunny', 'Un verano sin ti', 90), track('Bad Bunny', 'YHLQMDLG', 85), track('Guest', 'Single', 99)],
      'bad bunn',
    );

    expect(result.map((album) => album.albumName)).toEqual(['Un verano sin ti', 'YHLQMDLG']);
  });

  it('returns an empty list when there are no tracks', () => {
    expect(rankAlbumsByPopularity([], 'nobody')).toEqual([]);
  });
});
