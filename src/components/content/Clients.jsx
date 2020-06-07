import React from "react";
import { withRouter } from "react-router";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Fab from "@material-ui/core/Fab";
import Refresh from "@material-ui/icons/Refresh";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";

import shortid from "shortid";

import { socket } from "../../services/ws";

class Clients extends React.Component {
  state = { clients: [], socket: null };

  update() {
    this.socket.emit("get_clients");
    this.socket.on("clients_received", clients => {
      this.setState({
        clients: clients.clients
      });
    });
  }

  componentDidMount() {
    this.socket = socket;
    this.update();
  }

  componentWillUnmount() {
    this.socket.off();
  }
  render() {
    return (
      <main className="content">
        <Container maxWidth={false} className="container">
          <Grid container spacing={3}  className="grid-fixed-container">
            <Grid item xs={6} md={6} lg={1}>
              <Typography
                variant="h5"
                component="h1"
                align="left"
                className="title-container"
              >
                Clients
              </Typography>
            </Grid>
            <Grid item xs={6} md={6} lg={11} className="buttons-container">
              <Fab
                className="refresh-button-subs"
                onClick={() => this.update()}
              >
                <Refresh />
              </Fab>
            </Grid>
          </Grid>

          <Grid container>
            <Grid item xs={6} md={6} lg={12}>
              <Paper className="table-content">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Client name</TableCell>
                      <TableCell>Inbox ID</TableCell>
                      <TableCell>Subscriptions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.clients.map(row => (
                      <TableRow key={shortid.generate()}>
                        <TableCell component="th" scope="row">
                          {row.id}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {row.inbox}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {row.subscriptions_number}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </main>
    );
  }
}

const ClientsRouter = withRouter(Clients);

export { ClientsRouter };
