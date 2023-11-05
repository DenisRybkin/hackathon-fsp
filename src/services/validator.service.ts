export class ValidatorService {
    static transformStats = (res: any) => {
        const transformedRes = res.map(item => ({
            datid: 'db id: ' + item.datid,
            datname: 'username db name: ' + item.datname,
            pid: 'process id:' + item.pid,
            usename: 'username: ' + item.usename,
            application_name: 'app name: ' + item.application_name,
            query_start: 'start request date: ' + new Date(item.query_start)?.toLocaleString('en'),
            state_change: 'date last change: ' + new Date(item.state_change).toLocaleString('en'),
            state: 'process state: ' + item.state,
        }));

        return transformedRes.map(item =>
            Object.values(item).reduce((acc, cur) => `${acc}\n${cur}`, '')
        );
    };
    static cachingNormalValidator(value: number) {
        if(value > 90) {
            return '️✅ Buffer hit ratio is normal';
        } else {
            return '❗ Increase the shared_buffers parameter, or increase the RAM';
        }
    }
    static buffersBackendValidator(value: number) {
        if(value > 0) {
            return '❗️ Pay attention to the settings of the background writer, evaluate the performance of the disk system';
        } else {
            return '✅ The buffers_backend_fsync indicator is normal';
        }
    }
    static unusedIndexesValidator(rows: any = []) {
        const indexNames = rows.filter(r => !r.indexrelname.includes('pg_'));
        if(!indexNames.length) {
            return '✅ There are no unused indexes';
        } else {
            return '❗️ Unused indexes names: ' + indexNames.join(', ');
        }
    }
}