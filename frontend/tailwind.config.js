/** @type {import('tailwindcss').Config} */
export default {
  // 关键配置：告诉 Tailwind 扫描哪些文件来提取样式
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 补充二次元深色系专属配置
      colors: {
        'yoru-dark': '#05050a',      // 极暗背景色
        'neon-pink': '#ff007f',      // 霓虹粉
        'neon-purple': '#bc13fe',    // 荧光紫
        'cyber-blue': '#00f3ff',     // 赛博蓝
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          'from': { 'box-shadow': '0 0 5px #ff007f, 0 0 10px #ff007f' },
          'to': { 'box-shadow': '0 0 20px #ff007f, 0 0 30px #ff007f' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backgroundImage: {
        // 漫画网格背景效果
        'screentone': 'radial-gradient(#312e81 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}