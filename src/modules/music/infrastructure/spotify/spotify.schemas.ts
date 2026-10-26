import { z } from 'zod';

/*
 * Responses from an external API are untrusted data.
 * They are runtime-validated with zod: if Spotify changes its format,
 * it fails here with a clear error instead of breaking the domain with `undefined`.
 */
export const spotifyTokenSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.literal('Bearer'),
  expires_in: z.number().int().positive(),
});

const imageSchema = z.object({ url: z.string().url() });

export const spotifyTrackSearchSchema = z.object({
  tracks: z.object({
    items: z.array(
      z.object({
        popularity: z.number().int().min(0).max(100),
        artists: z.array(z.object({ name: z.string() })).min(1),
        album: z.object({
          name: z.string(),
          release_date: z.string(),
          total_tracks: z.number().int().nonnegative(),
          images: z.array(imageSchema),
        }),
      }),
    ),
  }),
});

export type SpotifyTrackSearch = z.infer<typeof spotifyTrackSearchSchema>;
