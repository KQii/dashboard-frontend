export default function Footer() {
  return (
    <footer className="w-full border-t bg-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Elasticsearch Monitoring System.
          Developed based on Elasticsearch and open-source monitoring tools.
        </p>

        <div className="flex gap-4 text-sm text-gray-600">
          <span className="font-bold">References:</span>
          <a
            href="https://www.elastic.co/docs"
            className="hover:text-gray-900 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            Elasticsearch
          </a>
          <a
            href="https://prometheus.io/docs/introduction/overview/"
            className="hover:text-gray-900 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            Prometheus
          </a>
          <a
            href="https://grafana.com/docs/"
            className="hover:text-gray-900 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            Grafana
          </a>
          <a
            href="https://prometheus.io/docs/alerting/latest/alertmanager/"
            className="hover:text-gray-900 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            Alertmanager
          </a>
        </div>
      </div>
    </footer>
  );
}
