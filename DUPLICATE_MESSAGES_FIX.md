# Duplicate Messages Fix

## Problem
Messages were being duplicated when reopening a chat session. Users would see the same message repeated 2-3 times.

## Root Cause
1. **Race Condition**: When loading messages from the database, the `messages` state change would trigger the `saveMessages` useEffect, which would delete and re-insert all messages.
2. **Poor Deduplication**: The deduplication logic used `timestamp` in the key, which could differ between database saves, making it ineffective.

## Solution

### 1. Improved Deduplication Logic
Updated `deduplicateMessages()` to:
- Use message `id` as primary deduplication key
- Use `role` + `content` as secondary key (without timestamp)
- This ensures same content is only shown once

```typescript
const deduplicateMessages = (msgs: Message[]): Message[] => {
  const seen = new Set<string>()
  const seenIds = new Set<string>()
  return msgs.filter(msg => {
    // If message has an ID, use that as primary deduplication key
    if (msg.id) {
      if (seenIds.has(msg.id)) return false
      seenIds.add(msg.id)
    }
    
    // Also deduplicate by content
    const key = `${msg.role}:${msg.content}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
```

### 2. Loading Guard
Added `loadingMessagesRef` to prevent saving messages while they're being loaded:
- Set flag to `true` before loading
- Clear flag after 1 second delay
- `saveMessages` useEffect checks this flag and skips if loading

```typescript
const loadingMessagesRef = useRef(false)

const loadChatMessages = async (chatId: string) => {
  loadingMessagesRef.current = true
  // ... load messages ...
  setTimeout(() => {
    loadingMessagesRef.current = false
  }, 1000)
}
```

### 3. Updated Save Guard
Modified the save useEffect to check the loading flag:
```typescript
if (!isInitialized || !currentChatId || messages.length === 0 || loadingMessagesRef.current) {
  return
}
```

## Testing
1. Open a chat with existing messages
2. Close and reopen the chat
3. Verify messages appear only once
4. Send new messages and verify they save correctly
5. Switch between multiple chats to verify no duplicates

## Files Modified
- `peos/components/ui/DealChat.tsx`
  - Updated `deduplicateMessages()` function
  - Added `loadingMessagesRef` guard
  - Modified `loadChatMessages()` to set loading flag
  - Updated save useEffect condition










