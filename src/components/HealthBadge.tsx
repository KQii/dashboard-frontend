interface HealthBadgeProps {
  status: 'green' | 'yellow' | 'red';
}

export function HealthBadge({ status }: HealthBadgeProps) {
  const colors = {
    green: 'bg-green-100 text-green-800 border-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    red: 'bg-red-100 text-red-800 border-red-300',
  };

  const labels = {
    green: 'Healthy',
    yellow: 'Degraded',
    red: 'Critical',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${colors[status]}`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${
        status === 'green' ? 'bg-green-500' :
        status === 'yellow' ? 'bg-yellow-500' :
        'bg-red-500'
      }`} />
      {labels[status]}
    </span>
  );
}
