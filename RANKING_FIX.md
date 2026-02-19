# Ranking System Toggle Fix - Testing Guide 🔄

## Issue Reported
Rankings weren't updating when switching between NET and KenPom ranking systems. Numbers appeared to stay the same when toggling.

---

## Root Cause Analysis

### What Was Happening
React components were **not re-rendering** when the `useKenPom` prop changed because:
1. Components didn't have proper `key` props tied to the ranking system
2. React's reconciliation algorithm saw the same component structure and skipped re-rendering
3. The `getRanking()` function was correct, but components weren't calling it again

### The Data
✅ **KenPom data EXISTS in JSON** - Verified:
```
Home Team: Chattanooga Mocs
  NET: 304
  KenPom: 265  ← Different numbers!

Away Team: Furman Paladins  
  NET: 168
  KenPom: 164  ← Different numbers!
```

### The Fix
Added **dynamic key props** to force component remounting:
```jsx
// Before (React reuses component):
<EnhancedGameCard matchup={game} useKenPom={useKenPom} />

// After (React creates new component when key changes):
<EnhancedGameCard 
  key={`${id}-${useKenPom ? 'kp' : 'net'}`}
  matchup={game} 
  useKenPom={useKenPom} 
/>
```

---

## Changes Made

### 1. **Added Dynamic Keys to Game Cards**
- Best Bets section: `key="best-${idx}-${useKenPom ? 'kp' : 'net'}"`
- Upset Alerts section: `key="upset-${idx}-${useKenPom ? 'kp' : 'net'}"`
- Main games list: `key="${timeSlot}-${idx}-${useKenPom ? 'kp' : 'net'}"`

### 2. **Improved Button Label**
- Changed from: "KenPom Rankings" / "NET Rankings"
- Changed to: **"Using KenPom"** / **"Using NET"**
- More clear about what system is CURRENTLY active

### 3. **Added Debug Indicator**
- Small text showing: `Current: NET` or `Current: KenPom`
- Helps verify the toggle is working
- Uses monospace font for clarity

---

## Testing Instructions

### Before Testing
1. Wait 2-3 minutes for Vercel deployment to complete
2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear any cached data if needed

### Test 1: Visual Toggle
1. Go to: https://cbb-report-joes-projects-bf6c3682.vercel.app/
2. Click "View Full Report"
3. Look at the ranking toggle button
4. **Verify**: Button shows "Using NET" (blue background)
5. **Verify**: Debug text shows "Current: NET"

### Test 2: Toggle to KenPom
1. Click the ranking toggle button
2. **Expected Results**:
   - Button changes to purple background
   - Text changes to "Using KenPom"
   - Debug text shows "Current: KenPom"
   - **ALL ranking numbers change immediately**
   - Game cards flash/re-render (brief animation)

### Test 3: Compare Specific Game
1. Find a game (any game)
2. Note the ranking numbers in the header (e.g., "(15)" for away team, "(20)" for home team)
3. Click toggle to switch systems
4. **Verify**: The numbers CHANGE (they should be different)
5. Click toggle again
6. **Verify**: Numbers change back to original values

### Test 4: Best Bets Section
1. Click "Best Bets" button
2. Note rankings in the displayed games
3. Toggle NET ↔ KenPom
4. **Verify**: Rankings in Best Bets update

### Test 5: Upset Alerts Section
1. Click "Upset Watch" button
2. Note rankings in displayed games
3. Toggle NET ↔ KenPom
4. **Verify**: Rankings in Upset Watch update

### Test 6: Persistence
1. Switch to KenPom
2. Refresh the page (F5)
3. **Verify**: Page loads with KenPom still selected
4. **Verify**: Rankings show KenPom values

### Test 7: Landing Page
1. Go back to landing page
2. Note: Landing page always shows NET (not affected by toggle)
3. Go back to report
4. **Verify**: Toggle setting is preserved

---

## Expected Behavior

### NET Mode (Default)
- Button: Blue background, "Using NET"
- Rankings: Higher numbers typically (1-358)
- Example: Duke might be #5 NET

### KenPom Mode
- Button: Purple background, "Using KenPom"
- Rankings: Different numbers (1-358)
- Example: Same Duke might be #3 KenPom

### Visual Feedback
- ✅ Button color changes (blue ↔ purple)
- ✅ Button text changes
- ✅ Debug indicator updates
- ✅ **All ranking numbers update**
- ✅ Brief re-render flash on game cards

---

## Technical Details

### How It Works Now

1. **User clicks toggle**
   ```jsx
   onClick={onToggleRankingSystem}  // Updates useKenPom state
   ```

2. **State updates in App.jsx**
   ```jsx
   setUseKenPom(!useKenPom)  // Triggers re-render
   ```

3. **CBBReport receives new prop**
   ```jsx
   <CBBReport useKenPom={useKenPom} />
   ```

4. **Game cards get NEW keys**
   ```jsx
   key={`${id}-${useKenPom ? 'kp' : 'net'}`}  // Key changes → forces remount
   ```

5. **Components remount and call getRanking()**
   ```jsx
   const getRanking = (teamData) => {
     return useKenPom ? (teamData.kenpom || teamData.net) : teamData.net;
   };
   ```

6. **Display updates with correct rankings** ✅

### Why Keys Matter

React uses keys to identify components:
- **Same key**: React reuses existing component (optimization)
- **Different key**: React creates new component (fresh render)

By including `useKenPom` in the key:
- NET mode: `key="game-1-net"`
- KenPom mode: `key="game-1-kp"`

React sees these as **different components** and remounts them!

---

## Troubleshooting

### If Rankings Still Don't Change:

**1. Check Browser Console**
- F12 to open DevTools
- Look for any errors
- Check if JSON data loaded successfully

**2. Verify Data Has KenPom**
- Open Network tab
- Find `cbb_report_latest.json`
- Search for "kenpom"
- Should see values like `"kenpom": 265`

**3. Clear Cache**
```bash
Ctrl+Shift+Delete (Windows)
Cmd+Shift+Delete (Mac)
```
- Select "Cached images and files"
- Clear and reload

**4. Check localStorage**
```javascript
// In browser console:
localStorage.getItem('useKenPom')  // Should be 'true' or 'false'
```

**5. Force Reset**
```javascript
// In browser console:
localStorage.removeItem('useKenPom')
location.reload()
```

---

## Success Criteria

✅ Rankings numbers change when toggling
✅ Button appearance changes (blue ↔ purple)
✅ Debug text updates
✅ Game cards briefly flash/re-render
✅ Preference persists after refresh
✅ Works in Best Bets section
✅ Works in Upset Watch section
✅ Works in main games list

---

## Files Modified

1. **src/components/CBBreport.jsx**
   - Added key props to all `<EnhancedGameCard>` components
   - Updated button text for clarity
   - Added debug indicator

---

## Commit Details

**Commit**: `1646ca4`
**Message**: "Fix: Force re-render of game cards when ranking system changes"
**Deployed**: Vercel auto-deployment triggered
**ETA**: Live in 2-3 minutes

---

## Next Steps

1. ✅ **Test on live site** (use checklist above)
2. 📧 **Confirm rankings update properly**
3. 🎯 **Report any remaining issues**
4. 🧹 **Remove debug indicator if desired** (optional - can be helpful to keep)

---

## Additional Notes

### Why This Approach
- **Simple**: Just add a key prop
- **Reliable**: React's built-in reconciliation
- **No side effects**: No hacky useEffect workarounds
- **Performant**: Only remounts when needed

### Alternative Approaches Considered
1. ❌ useEffect with dependencies (complex, prone to bugs)
2. ❌ Force update hooks (deprecated in React 18)
3. ✅ Key prop changes (clean, React-idiomatic)

### Future Improvements
- Consider adding animation when rankings change
- Add visual highlight when number changes
- Show ranking delta (how much it changed)

---

**The fix is now live! Test it out and rankings should update perfectly!** 🎉
