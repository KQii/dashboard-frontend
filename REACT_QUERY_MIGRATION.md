# React Query Migration Summary

## ✅ What Was Changed

### 1. **Installed Dependencies**

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### 2. **Setup QueryClient** (`src/main.tsx`)

- Created `QueryClient` with default options:
  - `staleTime: 25000` - Data stays fresh for 25 seconds
  - `refetchInterval: 30000` - Auto-refresh every 30 seconds
  - `retry: 2` - Retry failed requests twice
  - `refetchOnWindowFocus: false` - Don't refetch when window regains focus
- Wrapped app with `QueryClientProvider`
- Added `ReactQueryDevtools` for debugging (bottom-right corner in dev mode)

### 3. **Created Query Hooks** (`src/hooks/useDashboardQueries.ts`)

New custom hooks for all dashboard queries:

- `useClusterMetrics()` - Cluster health metrics
- `useCPUMetrics(timeRange)` - CPU usage per node
- `useJVMMemoryMetrics(timeRange)` - JVM memory stats
- `useSearchMetrics(timeRange)` - Search operations rate
- `useQueryLatencyMetrics(timeRange)` - Query latency percentiles
- `useActiveAlerts()` - Active alerts from AlertManager

All hooks have built-in:

- Auto-refresh every 30 seconds
- Loading states
- Error handling
- Caching
- Automatic refetch when `timeRange` changes

### 4. **Refactored Dashboard** (`src/pages/Dashboard.tsx`)

#### Before (147 lines):

```typescript
// ❌ 8 state variables
const [clusterMetrics, setClusterMetrics] = useState(...);
const [cpuMetrics, setCpuMetrics] = useState(...);
// ... 6 more

// ❌ 4 loading state variables
const [isLoadingCluster, setIsLoadingCluster] = useState(true);
// ... 3 more

// ❌ Complex data fetching logic
const loadAllData = useCallback(async () => {
  setIsRefreshing(true);
  try {
    const [cluster, cpu, jvm, search, latency, alertsData] = await Promise.all([...]);
    setClusterMetrics(cluster);
    // ... set all states
  } finally {
    setIsLoadingCluster(false);
    // ... set all loading states
  }
}, [timeRange]);

// ❌ Manual auto-refresh
const { countdown, lastUpdated, refresh } = useAutoRefresh(loadAllData, 30000);
```

#### After (105 lines):

```typescript
// ✅ Simple query hooks - no manual state management!
const { data: clusterMetrics, isLoading: isLoadingCluster, refetch: refetchCluster } = useClusterMetrics();
const { data: cpuMetrics = [], isLoading: isLoadingCpu, refetch: refetchCpu } = useCPUMetrics(timeRange);
// ... 4 more hooks

// ✅ Simple manual refresh
const handleRefresh = async () => {
  await Promise.all([refetchCluster(), refetchCpu(), ...]);
};

// ✅ Time range changes automatically trigger refetch
const handleTimeRangeChange = (newRange: TimeRange) => {
  setTimeRange(newRange);
};
```

## 🎯 Benefits Achieved

### Code Reduction

- **42 lines removed** (147 → 105 lines, 28.6% reduction)
- Eliminated 8 `useState` hooks for data
- Eliminated 4 `useState` hooks for loading states
- Removed 1 `useCallback` hook
- Removed `useAutoRefresh` hook usage
- Removed 2 complex async functions

### Features Added

- ✅ **Automatic caching** - Data shared across components
- ✅ **Built-in retry logic** - Auto-retry failed requests
- ✅ **Background refetching** - Data stays fresh automatically
- ✅ **Request deduplication** - Multiple components can use same query
- ✅ **DevTools** - Visual debugging (press `Ctrl+Shift+Q` to toggle)
- ✅ **Better UX** - Instant cached data on mount, then background update

### Performance Improvements

- **Reduced re-renders** - React Query optimizes render cycles
- **Smart refetching** - Only refetches when data is stale
- **Parallel requests** - All queries run simultaneously
- **Memory efficient** - Automatic garbage collection of unused queries

## 🎨 How It Works

### Auto-Refresh Pattern

```typescript
// React Query handles this automatically!
queryKey: ['cpuMetrics', timeRange],
refetchInterval: 30000, // Auto-refetch every 30s
```

### Time Range Changes

```typescript
// When timeRange changes, React Query automatically:
// 1. Checks if data for new timeRange is cached
// 2. If yes: shows cached data immediately + refetch in background
// 3. If no: fetches new data
const { data } = useCPUMetrics(timeRange); // ← timeRange in queryKey
```

### Manual Refresh

```typescript
// Trigger refetch on demand
const { refetch } = useClusterMetrics();
await refetch(); // Force fetch fresh data
```

## 🔧 React Query DevTools

Press the **React Query icon** (floating button) in bottom-right corner to:

- See all active queries and their states
- Inspect cached data
- View query timelines
- Manually trigger refetches
- See network request details

## 📊 Query States

Each query can be in these states:

- **`isLoading`** - First fetch in progress
- **`isFetching`** - Background refetch in progress
- **`isError`** - Query failed
- **`isSuccess`** - Data available
- **`isStale`** - Data older than `staleTime`

## 🚀 Next Steps

If this works well, consider migrating:

1. **AlertsPage** - Multiple queries (rules, channels, history)
2. **AdministrationPage** - User management queries
3. **ProfilePage** - User profile data

## 🐛 Troubleshooting

### Data not updating?

- Check DevTools - is query refetching?
- Verify `refetchInterval: 30000` is set
- Check browser console for errors

### Stale data showing?

- Adjust `staleTime` in query options
- Call `refetch()` manually if needed

### Too many refetches?

- Increase `staleTime` and `refetchInterval`
- Set `refetchOnWindowFocus: false` (already done)

## 📚 Resources

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Query Keys](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [Query Options](https://tanstack.com/query/latest/docs/react/reference/useQuery)
