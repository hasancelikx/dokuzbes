const U = (id: string, w = 400, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`

export const PA: Record<string, string> = {
  'Leyla':      U('1531746020798-e6953c6e8e04'),
  'Ece Yıldız': U('1494790108377-be9c29b29330'),
  'Selin':      U('1517841905240-472988babdf9'),
  'Zeynep':     U('1524504388940-b1c1722653e8'),
  'Luna':       U('1534528741775-53994a69daeb'),
  'Ayşe G.':    U('1488426862026-3ee34a7d66df'),
  'Mia':        U('1544005313-94ddf0286df2'),
  'Karla':      U('1520813792240-56fc4a3765a7'),
}

export const CA: Record<string, string> = {
  'Mert Koçak':     U('1507003211169-0a1dd7228f2d', 200, 200),
  'Ahmet Yıldız':   U('1500648767791-00dcc994a43e', 200, 200),
  'Can Berberoğlu': U('1506794778202-cad84cf45f1d', 200, 200),
  'Emre Tuna':      U('1472099645785-5658abf4ff4e', 200, 200),
  'Burak Arslan':   U('1519085360753-af0119f7cbe7', 200, 200),
  'Selim Doğan':    U('1463453091185-61582044d556', 200, 200),
  'Okan Mehmet':    U('1504257432389-52343af06ae3', 200, 200),
  'Cem Yılmaz':     U('1548372290-8d01b6c8e78c',   200, 200),
}
