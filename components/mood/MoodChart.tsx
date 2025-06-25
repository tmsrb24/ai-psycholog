import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function MoodChart({ data }: { data:{log_date:string,score:number}[] }) {
  const labels = data.map(d=>d.log_date);
  const scores = data.map(d=>d.score);
  return (
    <Line
      data={{
        labels,
        datasets:[{
          label:'Nálada',
          data:scores,
          tension:0.3,
          borderWidth:2,
          pointRadius:4
        }]
      }}
      options={{
        scales:{ y:{ min:1,max:5, ticks:{ stepSize:1 } } }
      }}
    />
  );
}
