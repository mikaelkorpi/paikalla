// How each traveller looks in the office world. Matched by first name (lowercase) of display_name.
// Based on the team photos on ilmiotalent.fi. Anyone not listed gets a generated look.
export type HairStyle = 'short' | 'curly' | 'buzz' | 'long' | 'bob' | 'ponytail'
export type Beard = 'none' | 'stubble' | 'full'

export type Look = {
  skin: string
  hair: HairStyle
  hairColor: string
  beard: Beard
  top: string
  pants: string
}

const SKIN = { fair: '#f2c9a5', light: '#e8b48c', tan: '#c98e62', brown: '#8d5a3b' }
const HAIR = { black: '#1d1512', darkBrown: '#3b2a20', brown: '#6b4a2f', lightBrown: '#9a6f45', blonde: '#d9b26a', auburn: '#a5512e' }

export const LOOKS: Record<string, Look> = {
  // Atte: short brown hair, full beard, black tee
  atte:   { skin: SKIN.fair,  hair: 'short', hairColor: HAIR.brown,      beard: 'full',    top: '#22252e', pants: '#3a4560' },
  // Mikael (Mikke): short dark curly hair, full beard, black shirt
  mikke:  { skin: SKIN.brown, hair: 'curly', hairColor: HAIR.black,      beard: 'full',    top: '#1c1f2a', pants: '#2f3a55' },
  mikael: { skin: SKIN.brown, hair: 'curly', hairColor: HAIR.black,      beard: 'full',    top: '#1c1f2a', pants: '#2f3a55' },
  // Sakari: very short dark hair, light stubble, black shirt
  sakari: { skin: SKIN.fair,  hair: 'buzz',  hairColor: HAIR.darkBrown,  beard: 'stubble', top: '#1f2533', pants: '#3a4560' },
  sakke:  { skin: SKIN.fair,  hair: 'buzz',  hairColor: HAIR.darkBrown,  beard: 'stubble', top: '#1f2533', pants: '#3a4560' },
  // Ella: long light brown hair, olive blazer
  ella:   { skin: SKIN.fair,  hair: 'long',  hairColor: HAIR.lightBrown, beard: 'none',    top: '#6f7552', pants: '#2b2f3a' },
  // Anton and Emmi: placeholders until confirmed
  anton:  { skin: SKIN.fair,  hair: 'short', hairColor: HAIR.blonde,     beard: 'none',    top: '#e9e2cf', pants: '#5a6a8a' },
  emmi:   { skin: SKIN.fair,  hair: 'ponytail', hairColor: HAIR.auburn,  beard: 'none',    top: '#1f2a44', pants: '#2b2f3a' },
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function lookFor(displayName: string, seed: string): Look {
  const key = displayName.trim().split(/\s+/)[0].toLowerCase()
  if (LOOKS[key]) return LOOKS[key]
  const h = hash(seed)
  const pick = <T,>(arr: T[], n: number) => arr[(h >> n) % arr.length]
  return {
    skin: pick(Object.values(SKIN), 0),
    hair: pick<HairStyle>(['short', 'curly', 'buzz', 'long', 'bob', 'ponytail'], 3),
    hairColor: pick(Object.values(HAIR), 6),
    beard: 'none',
    top: pick(['#c0392b', '#2e86c1', '#27ae60', '#8e44ad', '#d68910'], 9),
    pants: '#2f3a55',
  }
}
