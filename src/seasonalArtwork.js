// Bespoke Seasonal Vector Illustrations & Ornament System
// Includes Christmas (Pine Trees, Snowman, Snowflakes), Mid-Autumn (Full Moon, Mooncakes, Lanterns),
// Easter (Patterned Easter Eggs, Spring Blossoms), Tet (Peach/Apricot Blossoms, Lucky Envelopes, Bánh Chưng),
// and Autumn (Pumpkins, Maple Leaves, Wheat).

export function getSeasonalHeaderSvg(themeId) {
  switch (themeId) {
    case 'christmas_festive':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 156" width="100%" height="156" style="display:block;">
        <defs>
          <linearGradient id="xmasSky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0a2e1d"/>
            <stop offset="55%" stop-color="#12472e"/>
            <stop offset="100%" stop-color="#6b141a"/>
          </linearGradient>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fff6cc" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#f5d061" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Night & Pine Sky -->
        <rect width="680" height="156" fill="url(#xmasSky)"/>

        <!-- Falling Snowflakes & Stars -->
        <g fill="#ffffff" opacity="0.75">
          <circle cx="45" cy="24" r="2"/><circle cx="95" cy="48" r="1.5"/><circle cx="155" cy="18" r="2.2"/>
          <circle cx="220" cy="36" r="1.4"/><circle cx="290" cy="20" r="2"/><circle cx="350" cy="44" r="1.6"/>
          <circle cx="420" cy="22" r="2.2"/><circle cx="485" cy="52" r="1.5"/><circle cx="540" cy="18" r="2"/>
          <circle cx="635" cy="30" r="1.8"/><circle cx="600" cy="68" r="1.4"/><circle cx="130" cy="75" r="1.5"/>
          <!-- Detailed Snowflake 1 -->
          <g stroke="#ffffff" stroke-width="1.2" opacity="0.85" transform="translate(190,26)">
            <line x1="-6" y1="0" x2="6" y2="0"/><line x1="0" y1="-6" x2="0" y2="6"/>
            <line x1="-4" y1="-4" x2="4" y2="4"/><line x1="-4" y1="4" x2="4" y2="-4"/>
          </g>
          <!-- Detailed Snowflake 2 -->
          <g stroke="#ffffff" stroke-width="1.2" opacity="0.8" transform="translate(455,30)">
            <line x1="-5" y1="0" x2="5" y2="0"/><line x1="0" y1="-5" x2="0" y2="5"/>
            <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5"/><line x1="-3.5" y1="3.5" x2="3.5" y2="-3.5"/>
          </g>
        </g>

        <!-- Glowing Star of Bethlehem -->
        <circle cx="84" cy="26" r="22" fill="url(#starGlow)"/>
        <polygon points="84,10 87,21 98,24 87,27 84,38 81,27 70,24 81,21" fill="#ffeba8"/>

        <!-- Snow Hills Ground -->
        <path d="M0,132 Q140,114 310,130 T680,124 L680,156 L0,156 Z" fill="#e8f1ee" opacity="0.92"/>
        <path d="M0,140 Q220,126 440,138 T680,134 L680,156 L0,156 Z" fill="#ffffff"/>

        <!-- Left Pine Tree Forest (Cây thông Giáng sinh) -->
        <!-- Background Pine -->
        <g transform="translate(26, 52)">
          <polygon points="24,0 4,32 44,32" fill="#0d3b26"/>
          <polygon points="24,18 0,54 48,54" fill="#0d3b26"/>
          <polygon points="24,36 -4,78 52,78" fill="#0a301e"/>
        </g>
        <!-- Main Decorated Christmas Tree -->
        <g transform="translate(60, 32)">
          <rect x="20" y="92" width="8" height="14" fill="#4a2c18"/>
          <polygon points="24,0 4,34 44,34" fill="#17633e"/>
          <polygon points="24,20 -2,60 50,60" fill="#145736"/>
          <polygon points="24,42 -8,94 56,94" fill="#0f472b"/>
          <!-- Snow caps on branches -->
          <path d="M24,0 L12,20 Q24,23 36,20 Z" fill="#ffffff" opacity="0.85"/>
          <!-- Golden Garland & Ornaments -->
          <path d="M12,30 Q24,38 38,28" fill="none" stroke="#f5d061" stroke-width="1.5" stroke-dasharray="2,2"/>
          <path d="M5,55 Q24,66 44,52" fill="none" stroke="#f5d061" stroke-width="1.5" stroke-dasharray="2,2"/>
          <path d="M0,84 Q24,95 49,78" fill="none" stroke="#f5d061" stroke-width="1.5" stroke-dasharray="2,2"/>
          <circle cx="18" cy="44" r="3" fill="#d9383a"/>
          <circle cx="32" cy="48" r="2.8" fill="#f5d061"/>
          <circle cx="12" cy="72" r="3.2" fill="#f5d061"/>
          <circle cx="28" cy="74" r="3.2" fill="#d9383a"/>
          <circle cx="38" cy="68" r="2.6" fill="#ffeba8"/>
        </g>

        <!-- Right Side: Charming Snowman (Người tuyết) & Pine Tree -->
        <!-- Right Pine Tree -->
        <g transform="translate(598, 38)">
          <rect x="21" y="88" width="8" height="14" fill="#4a2c18"/>
          <polygon points="25,0 6,32 44,32" fill="#17633e"/>
          <polygon points="25,18 0,56 50,56" fill="#135233"/>
          <polygon points="25,38 -6,90 56,90" fill="#0e4027"/>
          <circle cx="18" cy="44" r="2.8" fill="#f5d061"/>
          <circle cx="31" cy="62" r="3" fill="#d9383a"/>
          <circle cx="15" cy="74" r="2.8" fill="#d9383a"/>
          <polygon points="25,-6 27,-1 32,-1 28,2 29,7 25,4 21,7 22,2 18,-1 23,-1" fill="#f5d061"/>
        </g>

        <!-- Snowman (Người tuyết) -->
        <g transform="translate(546, 62)">
          <!-- Bottom & Middle & Head Snowballs -->
          <circle cx="24" cy="60" r="18" fill="#ffffff" stroke="#d5e3de" stroke-width="1"/>
          <circle cx="24" cy="36" r="13.5" fill="#ffffff" stroke="#d5e3de" stroke-width="1"/>
          <circle cx="24" cy="15" r="10.5" fill="#ffffff" stroke="#d5e3de" stroke-width="1"/>
          <!--Stick Arms -->
          <line x1="11" y1="32" x2="-4" y2="22" stroke="#5c3a21" stroke-width="2" stroke-linecap="round"/>
          <line x1="37" y1="32" x2="50" y2="24" stroke="#5c3a21" stroke-width="2" stroke-linecap="round"/>
          <!-- Top Hat -->
          <rect x="11" y="2" width="26" height="3.5" rx="1.5" fill="#1e293b"/>
          <rect x="15" y="-10" width="18" height="13" rx="1" fill="#1e293b"/>
          <rect x="15" y="-1" width="18" height="3" fill="#b91c1c"/>
          <!-- Eyes, Carrot Nose & Coal Buttons -->
          <circle cx="20.5" cy="13" r="1.4" fill="#1e293b"/>
          <circle cx="27" cy="13" r="1.4" fill="#1e293b"/>
          <polygon points="23,15.5 34,17.5 23,18.5" fill="#ea580c"/>
          <circle cx="24" cy="33" r="1.6" fill="#1e293b"/>
          <circle cx="24" cy="40" r="1.6" fill="#1e293b"/>
          <circle cx="24" cy="52" r="1.8" fill="#1e293b"/>
          <!-- Red Festive Scarf -->
          <path d="M13,23 Q24,28 35,23" fill="none" stroke="#b91c1c" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M29,24 L32,39 L26,38 Z" fill="#b91c1c"/>
        </g>

        <!-- Center Festive Typography Medallion -->
        <g transform="translate(340, 68)" text-anchor="middle">
          <rect x="-175" y="-32" width="350" height="58" rx="29" fill="#072416" fill-opacity="0.58" stroke="#f5d061" stroke-width="1" stroke-opacity="0.65"/>
          <text y="-8" fill="#f5d061" font-family="Georgia, serif" font-size="11" letter-spacing="3" font-weight="bold">CHRISTMAS &amp; ADVENT EDITION</text>
          <text y="14" fill="#ffffff" font-family="Georgia, serif" font-size="15.5" font-style="italic">Season’s Greetings to Our Concordia Community</text>
        </g>
      </svg>`;

    case 'mid_autumn':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 156" width="100%" height="156" style="display:block;">
        <defs>
          <linearGradient id="midSky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f1e36"/>
            <stop offset="60%" stop-color="#1b355c"/>
            <stop offset="100%" stop-color="#2c224d"/>
          </linearGradient>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fff3b0" stop-opacity="1"/>
            <stop offset="55%" stop-color="#f6c945" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#f6c945" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="680" height="156" fill="url(#midSky)"/>

        <!-- Starry Sky -->
        <g fill="#fde68a" opacity="0.7">
          <circle cx="40" cy="30" r="1.5"/><circle cx="140" cy="22" r="1.8"/><circle cx="240" cy="40" r="1.2"/>
          <circle cx="430" cy="25" r="1.6"/><circle cx="510" cy="45" r="1.4"/><circle cx="640" cy="28" r="1.8"/>
        </g>

        <!-- Full Harvest Moon (Mặt trăng rằm) -->
        <circle cx="105" cy="76" r="58" fill="url(#moonGlow)" opacity="0.35"/>
        <circle cx="105" cy="76" r="38" fill="#ffefa8" stroke="#f5cb5c" stroke-width="1.5"/>
        <!-- Subtle Moon Rabbit / Crater silhouette -->
        <circle cx="93" cy="66" r="7" fill="#f3d36b" opacity="0.45"/>
        <circle cx="116" cy="84" r="9" fill="#f3d36b" opacity="0.4"/>
        <!-- Golden Oriental Clouds (Mây ngũ sắc) -->
        <path d="M35,102 Q55,90 78,100 Q98,88 120,102 Q135,96 150,106 L35,106 Z" fill="#1b355c" opacity="0.85"/>
        <path d="M32,104 Q55,92 78,102 Q98,90 122,104" fill="none" stroke="#f5cb5c" stroke-width="1.8"/>

        <!-- Hanging Glowing Lanterns (Đèn lồng Trung Thu) -->
        <!-- Lantern 1 -->
        <g transform="translate(185, 0)">
          <line x1="16" y1="0" x2="16" y2="26" stroke="#f5cb5c" stroke-width="1.5"/>
          <ellipse cx="16" cy="42" rx="16" ry="13" fill="#d93829" stroke="#f5cb5c" stroke-width="1.2"/>
          <path d="M8,31 Q16,42 8,53 M24,31 Q16,42 24,53" fill="none" stroke="#f5cb5c" stroke-width="0.9" opacity="0.8"/>
          <rect x="11" y="26" width="10" height="3.5" fill="#f5cb5c"/>
          <rect x="11" y="54" width="10" height="3.5" fill="#f5cb5c"/>
          <line x1="14" y1="57.5" x2="13" y2="70" stroke="#f5cb5c" stroke-width="1.2"/>
          <line x1="18" y1="57.5" x2="19" y2="70" stroke="#f5cb5c" stroke-width="1.2"/>
        </g>

        <!-- Right Side: Detailed Traditional Mooncakes (Bánh Trung Thu) & Lantern -->
        <!-- Lantern 2 -->
        <g transform="translate(495, 0)">
          <line x1="14" y1="0" x2="14" y2="18" stroke="#f5cb5c" stroke-width="1.5"/>
          <ellipse cx="14" cy="32" rx="14" ry="11" fill="#e06d1b" stroke="#f5cb5c" stroke-width="1.2"/>
          <rect x="10" y="19" width="8" height="3" fill="#f5cb5c"/>
          <rect x="10" y="42" width="8" height="3" fill="#f5cb5c"/>
          <line x1="14" y1="45" x2="14" y2="56" stroke="#f5cb5c" stroke-width="1.5"/>
        </g>

        <!-- Detailed Mooncake (Bánh Trung Thu nướng hoa văn) -->
        <g transform="translate(555, 42)">
          <!-- Scalloped Crust Edge -->
          <circle cx="42" cy="42" r="34" fill="#b85d19" stroke="#f5cb5c" stroke-width="1.5"/>
          <circle cx="42" cy="42" r="30" fill="#d47524" stroke="#8c3f09" stroke-width="1.2" stroke-dasharray="6,3"/>
          <!-- Inner Stamped Lattice Pattern -->
          <circle cx="42" cy="42" r="24" fill="none" stroke="#783205" stroke-width="1.3"/>
          <rect x="28" y="28" width="28" height="28" rx="4" fill="#c46618" stroke="#783205" stroke-width="1.3"/>
          <!-- Four Lotus Petals & Center Egg Yolk Dot -->
          <circle cx="42" cy="42" r="6" fill="#fbbf24" stroke="#783205" stroke-width="1"/>
          <line x1="42" y1="18" x2="42" y2="28" stroke="#783205" stroke-width="1.3"/>
          <line x1="42" y1="56" x2="42" y2="66" stroke="#783205" stroke-width="1.3"/>
          <line x1="18" y1="42" x2="28" y2="42" stroke="#783205" stroke-width="1.3"/>
          <line x1="56" y1="42" x2="66" y2="42" stroke="#783205" stroke-width="1.3"/>
        </g>

        <!-- Center Mid-Autumn Medallion -->
        <g transform="translate(345, 78)" text-anchor="middle">
          <rect x="-145" y="-32" width="290" height="58" rx="29" fill="#091526" fill-opacity="0.6" stroke="#f5cb5c" stroke-width="1" stroke-opacity="0.7"/>
          <text y="-8" fill="#f5cb5c" font-family="Georgia, serif" font-size="11" letter-spacing="2.8" font-weight="bold">MID-AUTUMN FESTIVAL</text>
          <text y="14" fill="#ffffff" font-family="Georgia, serif" font-size="15" font-style="italic">Vui Tết Trung Thu &bull; Full Moon &amp; Community</text>
        </g>
      </svg>`;

    case 'easter_spring':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 150" width="100%" height="150" style="display:block;">
        <defs>
          <linearGradient id="easterSky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#134e35"/>
            <stop offset="55%" stop-color="#1d6b48"/>
            <stop offset="100%" stop-color="#48366b"/>
          </linearGradient>
        </defs>
        <rect width="680" height="150" fill="url(#easterSky)"/>

        <!-- Soft Meadow Wave -->
        <path d="M0,124 Q170,108 340,124 T680,118 L680,150 L0,150 Z" fill="#dff2e6" opacity="0.25"/>
        <path d="M0,134 Q220,120 450,134 T680,128 L680,150 L0,150 Z" fill="#f5faf7"/>

        <!-- Left Group: Ornate Decorated Easter Eggs (Trứng Phục Sinh) -->
        <!-- Egg 1 (Lavender & Gold Zigzag) -->
        <g transform="translate(52, 54) rotate(-10)">
          <path d="M22,0 C8,0 0,22 0,38 C0,52 9,60 22,60 C35,60 44,52 44,38 C44,22 36,0 22,0 Z" fill="#e9d5ff" stroke="#f5d061" stroke-width="1.5"/>
          <path d="M3,26 L11,20 L19,26 L27,20 L35,26 L41,21" fill="none" stroke="#7e22ce" stroke-width="2"/>
          <path d="M1,38 L43,38" stroke="#f59e0b" stroke-width="2.5"/>
          <circle cx="14" cy="47" r="2.2" fill="#7e22ce"/>
          <circle cx="22" cy="48" r="2.2" fill="#7e22ce"/>
          <circle cx="30" cy="47" r="2.2" fill="#7e22ce"/>
        </g>
        <!-- Egg 2 (Gold & Emerald Floral) -->
        <g transform="translate(96, 46) rotate(6)">
          <path d="M24,0 C9,0 0,24 0,42 C0,57 10,66 24,66 C38,66 48,57 48,42 C48,24 39,0 24,0 Z" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
          <path d="M4,24 Q24,32 44,24" fill="none" stroke="#15803d" stroke-width="2"/>
          <path d="M2,44 Q24,52 46,44" fill="none" stroke="#15803d" stroke-width="2"/>
          <circle cx="24" cy="35" r="4" fill="#d97706"/>
          <circle cx="13" cy="34" r="2.5" fill="#15803d"/>
          <circle cx="35" cy="34" r="2.5" fill="#15803d"/>
        </g>

        <!-- Right Group: Decorated Easter Egg & Spring Blossoms -->
        <g transform="translate(565, 50) rotate(-6)">
          <path d="M23,0 C8,0 0,23 0,40 C0,55 9,63 23,63 C37,63 46,55 46,40 C46,23 38,0 23,0 Z" fill="#bbf7d0" stroke="#ffffff" stroke-width="1.5"/>
          <path d="M4,28 L42,28 M2,40 L44,40" stroke="#047857" stroke-width="2"/>
          <circle cx="14" cy="34" r="2.3" fill="#f59e0b"/>
          <circle cx="23" cy="34" r="2.3" fill="#f59e0b"/>
          <circle cx="32" cy="34" r="2.3" fill="#f59e0b"/>
        </g>
        <!-- Spring Flower Blossom -->
        <g transform="translate(535, 86)">
          <circle cx="0" cy="-8" r="6" fill="#fbcfe8"/><circle cx="8" cy="-2" r="6" fill="#fbcfe8"/>
          <circle cx="5" cy="7" r="6" fill="#fbcfe8"/><circle cx="-5" cy="7" r="6" fill="#fbcfe8"/>
          <circle cx="-8" cy="-2" r="6" fill="#fbcfe8"/><circle cx="0" cy="0" r="4.5" fill="#facc15"/>
        </g>

        <!-- Center Easter Medallion -->
        <g transform="translate(340, 72)" text-anchor="middle">
          <rect x="-160" y="-30" width="320" height="54" rx="27" fill="#0b2e1f" fill-opacity="0.55" stroke="#fde68a" stroke-width="1" stroke-opacity="0.65"/>
          <text y="-7" fill="#fde68a" font-family="Georgia, serif" font-size="11" letter-spacing="2.8" font-weight="bold">EASTER &amp; SPRING RENEWAL</text>
          <text y="13" fill="#ffffff" font-family="Georgia, serif" font-size="15" font-style="italic">Celebrating Hope, Joy &amp; New Beginnings</text>
        </g>
      </svg>`;

    case 'tet_lunar':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 152" width="100%" height="152" style="display:block;">
        <defs>
          <linearGradient id="tetSky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6e0d10"/>
            <stop offset="50%" stop-color="#991b1f"/>
            <stop offset="100%" stop-color="#7c2d12"/>
          </linearGradient>
        </defs>
        <rect width="680" height="152" fill="url(#tetSky)"/>

        <!-- Left Branch: Hanoi Pink Peach Blossoms (Hoa Đào) -->
        <path d="M0,38 Q65,45 125,78 M55,46 Q85,28 115,32" fill="none" stroke="#4a2511" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Peach Blossom Flowers -->
        <g transform="translate(75, 52)">
          <circle cx="0" cy="-7" r="5.5" fill="#fda4af"/><circle cx="7" cy="-2" r="5.5" fill="#fda4af"/>
          <circle cx="4" cy="6" r="5.5" fill="#fda4af"/><circle cx="-4" cy="6" r="5.5" fill="#fda4af"/>
          <circle cx="-7" cy="-2" r="5.5" fill="#fda4af"/><circle cx="0" cy="0" r="3" fill="#fef08a"/>
        </g>
        <g transform="translate(115, 32) scale(0.85)">
          <circle cx="0" cy="-7" r="5.5" fill="#f43f5e"/><circle cx="7" cy="-2" r="5.5" fill="#fb7185"/>
          <circle cx="4" cy="6" r="5.5" fill="#fb7185"/><circle cx="-4" cy="6" r="5.5" fill="#fb7185"/>
          <circle cx="-7" cy="-2" r="5.5" fill="#fb7185"/><circle cx="0" cy="0" r="3" fill="#fef08a"/>
        </g>
        <g transform="translate(125, 78) scale(0.9)">
          <circle cx="0" cy="-7" r="5.5" fill="#fda4af"/><circle cx="7" cy="-2" r="5.5" fill="#fda4af"/>
          <circle cx="4" cy="6" r="5.5" fill="#fda4af"/><circle cx="-4" cy="6" r="5.5" fill="#fda4af"/>
          <circle cx="-7" cy="-2" r="5.5" fill="#fda4af"/><circle cx="0" cy="0" r="3" fill="#fef08a"/>
        </g>

        <!-- Right Side: Golden Apricot Blossoms (Hoa Mai) & Lucky Red Envelope (Bao Lì Xì) -->
        <g transform="translate(555, 36) rotate(8)">
          <rect x="0" y="0" width="44" height="68" rx="4" fill="#dc2626" stroke="#facc15" stroke-width="1.8"/>
          <path d="M0,18 Q22,32 44,18" fill="none" stroke="#facc15" stroke-width="1.5"/>
          <circle cx="22" cy="36" r="10" fill="#facc15"/>
          <rect x="18" y="32" width="8" height="8" fill="#dc2626" transform="rotate(45 22 36)"/>
        </g>
        <!-- Yellow Mai Blossom -->
        <g transform="translate(622, 62)">
          <circle cx="0" cy="-7" r="5.5" fill="#facc15"/><circle cx="7" cy="-2" r="5.5" fill="#facc15"/>
          <circle cx="4" cy="6" r="5.5" fill="#facc15"/><circle cx="-4" cy="6" r="5.5" fill="#facc15"/>
          <circle cx="-7" cy="-2" r="5.5" fill="#facc15"/><circle cx="0" cy="0" r="3" fill="#b91c1c"/>
        </g>

        <!-- Center Tet Medallion -->
        <g transform="translate(340, 76)" text-anchor="middle">
          <rect x="-165" y="-32" width="330" height="58" rx="29" fill="#450a0a" fill-opacity="0.6" stroke="#facc15" stroke-width="1.2" stroke-opacity="0.8"/>
          <text y="-8" fill="#facc15" font-family="Georgia, serif" font-size="11" letter-spacing="2.8" font-weight="bold">CHÚC MỪNG NĂM MỚI &bull; LUNAR NEW YEAR</text>
          <text y="14" fill="#ffffff" font-family="Georgia, serif" font-size="15" font-style="italic">Wishing Our Community Peace, Joy &amp; Prosperity</text>
        </g>
      </svg>`;

    case 'autumn_harvest':
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 150" width="100%" height="150" style="display:block;">
        <defs>
          <linearGradient id="autumnSky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#431407"/>
            <stop offset="55%" stop-color="#7c2d12"/>
            <stop offset="100%" stop-color="#14532d"/>
          </linearGradient>
        </defs>
        <rect width="680" height="150" fill="url(#autumnSky)"/>

        <!-- Left: Harvest Pumpkin (Bí ngô) & Falling Maple Leaves -->
        <g transform="translate(65, 58)">
          <path d="M26,8 C26,-2 32,-4 34,-4" fill="none" stroke="#3f6212" stroke-width="3.5" stroke-linecap="round"/>
          <ellipse cx="14" cy="34" rx="14" ry="22" fill="#c2410c" stroke="#7c2d12" stroke-width="1"/>
          <ellipse cx="38" cy="34" rx="14" ry="22" fill="#c2410c" stroke="#7c2d12" stroke-width="1"/>
          <ellipse cx="26" cy="35" rx="15" ry="24" fill="#ea580c" stroke="#9a3412" stroke-width="1.2"/>
        </g>
        <!-- Golden Maple Leaf -->
        <g transform="translate(135, 42) rotate(22) scale(0.9)">
          <path d="M0,-14 L4,-5 L13,-7 L8,1 L14,6 L4,8 L0,16 L-4,8 L-14,6 L-8,1 L-13,-7 L-4,-5 Z" fill="#f59e0b" stroke="#fef3c7" stroke-width="0.7"/>
        </g>

        <!-- Right: Golden Wheat Stalks & Maple Leaf -->
        <g transform="translate(580, 48) rotate(-15)">
          <path d="M0,-14 L4,-5 L13,-7 L8,1 L14,6 L4,8 L0,16 L-4,8 L-14,6 L-8,1 L-13,-7 L-4,-5 Z" fill="#dc2626" stroke="#fde68a" stroke-width="0.7"/>
        </g>
        <g transform="translate(545, 78)" stroke="#facc15" stroke-width="1.5" fill="#facc15">
          <line x1="0" y1="30" x2="25" y2="-15"/>
          <ellipse cx="10" cy="10" rx="4" ry="2" transform="rotate(-30 10 10)"/>
          <ellipse cx="16" cy="0" rx="4" ry="2" transform="rotate(-30 16 0)"/>
          <ellipse cx="22" cy="-10" rx="4" ry="2" transform="rotate(-30 22 -10)"/>
        </g>

        <!-- Center Thanksgiving Medallion -->
        <g transform="translate(340, 74)" text-anchor="middle">
          <rect x="-165" y="-30" width="330" height="54" rx="27" fill="#270e05" fill-opacity="0.55" stroke="#fcd34d" stroke-width="1" stroke-opacity="0.7"/>
          <text y="-7" fill="#fcd34d" font-family="Georgia, serif" font-size="11" letter-spacing="2.8" font-weight="bold">AUTUMN &amp; THANKSGIVING</text>
          <text y="13" fill="#ffffff" font-family="Georgia, serif" font-size="15" font-style="italic">A Season of Gratitude for Our Faculty &amp; Staff</text>
        </g>
      </svg>`;

    default:
      return '';
  }
}

/**
 * Subtle seasonal ornament divider rendered next to Section Kickers
 */
export function getSeasonalSectionMotifSvg(themeId) {
  switch (themeId) {
    case 'christmas_festive':
      // Holly berries & pine sprig
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 16" width="32" height="14" style="display:inline-block; vertical-align:middle; margin-right:6px;">
        <path d="M2,8 Q9,2 16,8 Q9,14 2,8 Z" fill="#15803d"/>
        <path d="M34,8 Q27,2 20,8 Q27,14 34,8 Z" fill="#15803d"/>
        <circle cx="18" cy="6" r="2.6" fill="#b91c1c"/>
        <circle cx="16" cy="10" r="2.4" fill="#dc2626"/>
        <circle cx="20" cy="10" r="2.4" fill="#dc2626"/>
      </svg>`;
    case 'mid_autumn':
      // Mini Full Moon & Cloud
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 16" width="24" height="14" style="display:inline-block; vertical-align:middle; margin-right:6px;">
        <circle cx="12" cy="8" r="6.5" fill="#f59e0b"/>
        <path d="M10,12 Q16,8 22,12 L10,12 Z" fill="#1e3a8a"/>
      </svg>`;
    case 'easter_spring':
      // Mini patterned Easter Egg
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 18" width="16" height="15" style="display:inline-block; vertical-align:middle; margin-right:6px;">
        <path d="M10,1 C4,1 1,8 1,12 C1,16 5,17 10,17 C15,17 19,16 19,12 C19,8 16,1 10,1 Z" fill="#8b5cf6"/>
        <path d="M2,10 L18,10" stroke="#fde047" stroke-width="2"/>
      </svg>`;
    case 'tet_lunar':
      // Mini Peach/Mai Blossom
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="16" height="16" style="display:inline-block; vertical-align:middle; margin-right:6px;">
        <circle cx="10" cy="5" r="3.5" fill="#e11d48"/><circle cx="15" cy="9" r="3.5" fill="#e11d48"/>
        <circle cx="13" cy="15" r="3.5" fill="#e11d48"/><circle cx="7" cy="15" r="3.5" fill="#e11d48"/>
        <circle cx="5" cy="9" r="3.5" fill="#e11d48"/><circle cx="10" cy="10" r="2.2" fill="#facc15"/>
      </svg>`;
    case 'autumn_harvest':
      // Mini Maple Leaf / Pumpkin
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 18" width="18" height="15" style="display:inline-block; vertical-align:middle; margin-right:6px;">
        <ellipse cx="8" cy="10" rx="5" ry="6.5" fill="#c2410c"/>
        <ellipse cx="14" cy="10" rx="5" ry="6.5" fill="#c2410c"/>
        <ellipse cx="11" cy="10" rx="5" ry="7" fill="#ea580c"/>
        <line x1="11" y1="1" x2="11" y2="4" stroke="#3f6212" stroke-width="2"/>
      </svg>`;
    default:
      return '';
  }
}

/**
 * Convert an inline SVG string into a PNG Data URL via offscreen <canvas>
 * so that when the user clicks "Copy for Email (Gmail/Outlook)", the seasonal illustration
 * is embedded as a real PNG image that Gmail will never strip!
 */
export async function convertSvgElementsToPngInContainer(containerEl) {
  if (!containerEl) return;
  const svgs = Array.from(containerEl.querySelectorAll('svg'));
  for (const svg of svgs) {
    try {
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svg);
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const rect = svg.getBoundingClientRect();
      const width = rect.width || 680;
      const height = rect.height || 150;

      const pngDataUrl = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = 2; // Retina 2x
          canvas.width = width * scale;
          canvas.height = height * scale;
          const ctx = canvas.getContext('2d');
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (e) => {
          URL.revokeObjectURL(url);
          reject(e);
        };
        img.src = url;
      });

      const imgReplacement = document.createElement('img');
      imgReplacement.src = pngDataUrl;
      imgReplacement.style.width = rect.width ? `${rect.width}px` : '100%';
      imgReplacement.style.maxWidth = '100%';
      imgReplacement.style.height = 'auto';
      imgReplacement.style.display = svg.style.display || 'inline-block';
      imgReplacement.style.verticalAlign = svg.style.verticalAlign || 'middle';
      imgReplacement.style.marginRight = svg.style.marginRight || '0';
      svg.replaceWith(imgReplacement);
    } catch (e) {
      console.warn('SVG to PNG conversion skipped for element:', e);
    }
  }
}

