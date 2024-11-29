import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 30 },
    header: {
        marginBottom: 20,
        textAlign: 'center',
        border: '1px solid #000',
        padding: 10,
        borderRadius: 5,
    },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    subheader: { fontSize: 12, marginBottom: 5 },
    section: {
        marginBottom: 20,
        border: '1px solid #000',
        padding: 10,
        borderRadius: 5,
    },
    content: { fontSize: 12, marginBottom: 3 },
    bold: { fontWeight: 'bold' },
    table: {
        display: 'table',
        width: 'auto',
        marginTop: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
    },
    tableRow: { flexDirection: 'row' },
    tableColHeader: {
        width: '20%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#f0f0f0',
        padding: 5,
        fontWeight: 'bold',
        fontSize: 10,
    },
    tableCol: {
        width: '20%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        padding: 5,
        fontSize: 10,
    },
    footer: { marginTop: 30, textAlign: 'right' },
    totalRow: { fontWeight: 'bold', fontSize: 14, marginTop: 10 },
});


const VentaPDF = ({ ventaData }) => { 
    const { cliente, pedidos, productos, nroFactura, fecha, total } = ventaData;

    const totalProductos = productos.reduce((sum, p) => sum + parseFloat(p.detventa_subtotal), 0);
    const costoEnvio = parseFloat(total) - totalProductos;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Encabezado */}
                <View style={styles.header}>
                    <Text style={styles.title}>Factura B</Text>
                    <Text style={styles.subheader}>Nro Serie: 0003    Nro Factura: {nroFactura}</Text>
                    <Text style={styles.subheader}>Fecha: {new Date(fecha).toLocaleDateString()}</Text>
                </View>

                {/* Información de la empresa */}
                <View style={styles.section}>
                    <Text style={styles.content}>NEWTON STATION S.R.L.</Text>
                    <Text style={styles.content}>Roseti 2118 (1427) C.A.B.A</Text>
                    <Text style={styles.content}>CIUDAD DE BUENOS AIRES</Text>
                    <Text style={styles.content}>IVA: RESPONSABLE INSCRIPTO</Text>
                    <Text style={styles.content}>CUIT: 30-71198096-9</Text>
                    <Text style={styles.content}>INICIO DE ACTIVIDADES: 01-08-2011</Text>
                </View>

                {/* Datos del cliente */}
                <View style={styles.section}>
                    <Text style={styles.bold}>Cliente: {cliente.nombre} {cliente.cli_apellido}</Text>
                    <Text style={styles.content}>Localidad: {cliente.provincia || '-'}</Text>
                    <Text style={styles.content}>DNI: {cliente.cli_dni}</Text>
                    <Text style={styles.content}>Pedido: {pedidos.map(p => p.pedido_id).join(', ')}</Text>
                    <Text style={styles.content}>Condiciones de Venta: Contado</Text>
                </View>

                {/* Tabla de productos */}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableColHeader}>Cod</Text>
                        <Text style={styles.tableColHeader}>Descripción</Text>
                        <Text style={styles.tableColHeader}>Cantidad</Text>
                        <Text style={styles.tableColHeader}>Precio Unit.</Text>
                        <Text style={styles.tableColHeader}>Subtotal</Text>
                    </View>
                    {productos.map((prod, index) => (
                        <View style={styles.tableRow} key={index}>
                            <Text style={styles.tableCol}>{prod.cod_prod}</Text>
                            <Text style={styles.tableCol}>{prod.nombre}</Text>
                            <Text style={styles.tableCol}>{prod.detventa_cantidad}</Text>
                            <Text style={styles.tableCol}>${parseFloat(prod.detventa_subtotal / prod.detventa_cantidad).toLocaleString('es-AR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}</Text>
                            <Text style={styles.tableCol}>${parseFloat(prod.detventa_subtotal).toLocaleString('es-AR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}</Text>
                        </View>
                    ))}
                    {/* Fila de costos adicionales */}
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCol}>-</Text>
                        <Text style={styles.tableCol}>Gastos de Envío</Text>
                        <Text style={styles.tableCol}>1</Text>
                        <Text style={styles.tableCol}>${parseFloat(costoEnvio).toLocaleString('es-AR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}</Text>
                        <Text style={styles.tableCol}>${parseFloat(costoEnvio).toLocaleString('es-AR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}</Text>
                    </View>
                </View>

                {/* Total */}
                <View style={styles.footer}>
                    <Text style={styles.totalRow}>TOTAL: ${parseFloat(total).toLocaleString('es-AR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}</Text>
                </View>
            </Page>
        </Document>
    );
};

export default VentaPDF;
