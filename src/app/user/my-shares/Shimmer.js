const Shimmer = () => {
  return (
    <div style={{
      padding: '1rem',
      maxWidth: '100%',
      overflowX: 'auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          height: '2rem',
          width: '12rem',
          backgroundColor: '#e5e7eb',
          borderRadius: '0.375rem',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
        <div style={{
          height: '2.5rem',
          width: '8rem',
          backgroundColor: '#e5e7eb',
          borderRadius: '0.375rem',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
      </div>

      {/* Search Box */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          height: '3rem',
          width: '100%',
          backgroundColor: '#e5e7eb',
          borderRadius: '0.375rem',
          marginBottom: '0.5rem',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
        <div style={{
          height: '1.25rem',
          width: '8rem',
          backgroundColor: '#e5e7eb',
          borderRadius: '0.375rem',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
      </div>

      {/* Table */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '50px 60px repeat(3, minmax(120px, 1fr)) 180px 120px 80px 160px 100px',
          gap: '0.5rem',
          padding: '0.75rem',
          backgroundColor: '#f3f4f6'
        }}>
          {[...Array(10)].map((_, i) => (
            <div 
              key={`head-${i}`}
              style={{
                height: '1.5rem',
                backgroundColor: '#d1d5db',
                borderRadius: '0.375rem',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />
          ))}
        </div>

        {/* Table Body */}
        <div style={{ borderTop: '1px solid #e5e7eb' }}>
          {[...Array(10)].map((_, rowIdx) => (
            <div 
              key={`row-${rowIdx}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '50px 60px repeat(3, minmax(120px, 1fr)) 180px 120px 80px 160px 100px',
                gap: '0.5rem',
                padding: '0.75rem',
                alignItems: 'center',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              <div style={shimmerCellStyle} />
              <div style={{ ...shimmerCellStyle, height: '2.5rem', width: '2.5rem', borderRadius: '9999px' }} />
              <div style={shimmerCellStyle} />
              <div style={shimmerCellStyle} />
              <div style={shimmerCellStyle} />
              <div style={shimmerCellStyle} />
              <div style={shimmerCellStyle} />
              <div style={{ ...shimmerCellStyle, height: '1.5rem', width: '3rem', borderRadius: '9999px' }} />
              <div style={shimmerCellStyle} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ ...shimmerCellStyle, height: '2rem', width: '2rem' }} />
                <div style={{ ...shimmerCellStyle, height: '2rem', width: '2rem' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const shimmerCellStyle = {
  height: '1.5rem',
  backgroundColor: '#f3f4f6',
  borderRadius: '0.375rem',
  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
};

export default Shimmer;