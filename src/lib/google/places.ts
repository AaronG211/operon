// Server-side Google Places API (New) — Nearby Search
export interface NearbyCompetitor {
  placeId: string;
  name: string;
  address: string;
  rating: number | null;
  userRatingCount: number | null;
  priceLevel: string | null;
  types: string[];
}

interface NearbySearchPlace {
  id?: string;
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  types?: string[];
}

interface NearbySearchResponse {
  places?: NearbySearchPlace[];
}

/**
 * Find nearby restaurants using Google Places API (New) Nearby Search.
 * Requires server-side GOOGLE_MAPS_API_KEY env var.
 */
export async function findNearbyCompetitors(
  lat: number,
  lng: number,
  radiusMeters: number = 1500
): Promise<NearbyCompetitor[]> {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("No GOOGLE_MAPS_API_KEY set, skipping nearby search");
    return [];
  }

  try {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.types",
        },
        body: JSON.stringify({
          includedTypes: ["restaurant"],
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: radiusMeters,
            },
          },
          maxResultCount: 15,
        }),
      }
    );

    if (!res.ok) {
      console.error("Nearby search failed:", res.status, await res.text());
      return [];
    }

    const data = (await res.json()) as NearbySearchResponse;
    const places = data.places ?? [];

    return places.map((place) => ({
      placeId: place.id || "",
      name: place.displayName?.text || "",
      address: place.formattedAddress || "",
      rating: place.rating ?? null,
      userRatingCount: place.userRatingCount ?? null,
      priceLevel: place.priceLevel ?? null,
      types: place.types || [],
    }));
  } catch (err) {
    console.error("Nearby search error:", err);
    return [];
  }
}
