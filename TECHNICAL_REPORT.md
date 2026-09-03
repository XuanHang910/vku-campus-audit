# Technical Report: VKU Campus Facilities Audit

## Section 1: Executive Summary & Problem Context
The **VKU Campus Facilities Audit** application addresses the critical need for reliable facility inspection in campus areas with poor or non-existent network connectivity (e.g., basements, remote structures). Facility inspectors and student auditors require a robust, mobile-friendly tool that allows uninterrupted data collection, including text, multi-step assessments, photos, and geolocation data. 

By leveraging an offline-first Progressive Web App (PWA) architecture with Service Workers and IndexedDB, wrapped gracefully via Capacitor for native capabilities, the application ensures that audits can be performed seamlessly anywhere. Data synchronizes silently to the server once connectivity is restored, completely eliminating data loss and manual record-keeping.

## Section 2: System Architecture & Data Flow
The system employs a **Cache-First** strategy for the App Shell via Service Workers (configured via `vite-plugin-pwa`), ensuring a cold boot latency of less than 1 second even during complete network disconnections.

Data persistence is managed locally using **IndexedDB**, orchestrated via a robust schema:
1. **Drafts Store:** Captures real-time form inputs to prevent data loss during browser refreshes or unexpected crashes.
2. **Sync Queue Store:** Holds submitted audits (PENDING_SYNC) awaiting an active network connection.
3. **Synced Items Store:** Archives successfully pushed records for historical review and local inspection.

A background **Sync Engine** monitors the device's network state (via Capacitor Network API and DOM events). Upon detecting a restored connection, it sequentially dispatches pending items to the server. If successful, items are moved from the queue to the local archive.

## Section 3: UI/UX & Implementation Details
The application is built on a modern stack: **React 19, TypeScript, Vite, Tailwind CSS 3, and Lucide Icons**.

**UI/UX Architecture (Glassmorphism):**
The interface utilizes a Mobile-First approach with a signature "Glassmorphism" design (`backdrop-blur`, semi-transparent panels) overlaid on VKU-themed pastel backgrounds. A Custom Stepper guides users through the audit process (Location ➔ Equipment ➔ Condition ➔ Evidence), reducing cognitive load. A built-in "Network Simulator" allows instant offline testing without developer tools.

**IndexedDB Queue Pattern:**
```typescript
export const moveToSyncQueue = async (draft: AuditRecord) => {
  const db = await initDB();
  const tx = db.transaction(['drafts', 'sync_queue'], 'readwrite');
  draft.status = 'PENDING_SYNC';
  await tx.objectStore('sync_queue').put(draft);
  await tx.objectStore('drafts').delete(draft.id);
  await tx.done;
};
```

**Hardware Abstraction (Capacitor):**
The app bridges web and native environments using Capacitor APIs:
- `@capacitor/camera`: Captures evidence natively or falls back to WebRTC.
- `@capacitor/geolocation`: Accurately tags audits with GPS coordinates.

## Section 4: Testing Matrix & Validation

| Scenario | Expected Outcome | Status |
| :--- | :--- | :--- |
| **Offline Cold Boot** | App loads immediately using cached App Shell. | ✅ Passed |
| **Draft Auto-Save** | Refreshing the page retains entered form data in IndexedDB. | ✅ Passed |
| **Submit Offline** | Audit moves to Sync Queue, UI flashes pending badge count. | ✅ Passed |
| **Network Simulator** | Toggling the top-bar simulator instantly pauses/resumes syncs. | ✅ Passed |
| **Network Restore** | Pending items sync automatically, moving to "Synced" tab. | ✅ Passed |
| **Data Export** | JSON/CSV export generates and downloads correctly. | ✅ Passed |

## Section 5: Conclusion
The VKU Campus Audit application successfully demonstrates the power of modern PWA paradigms combined with thoughtful UI design. It provides an enterprise-grade, offline-capable solution tailored specifically for the logistical realities of campus facility management.
